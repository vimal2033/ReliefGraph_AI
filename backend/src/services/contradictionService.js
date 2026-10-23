import { getGeminiClient, GEMINI_MODEL } from '../config/gemini.js';
import { Alert } from '../models/Alert.js';
import { Report } from '../models/Report.js';
import { Dispatch } from '../models/Dispatch.js';
import { Shelter } from '../models/Shelter.js';
import { Need } from '../models/Need.js';

/**
 * Evaluates chronological reports & dispatches for a shelter + resource category
 * to detect unverified deliveries, quantity gaps, and lingering unmet needs.
 */
export async function evaluateContradictions(shelterId, resourceCategory, isSimulation = false) {
  try {
    const shelter = await Shelter.findById(shelterId);
    if (!shelter) return null;

    // Fetch relevant reports & dispatches sorted chronologically
    const reports = await Report.find({
      'extracted.matchedShelterId': shelterId,
      'extracted.resourceCategory': resourceCategory,
    }).sort({ timestamp: 1 });

    const dispatches = await Dispatch.find({
      shelterId: shelterId,
      resourceCategory: resourceCategory,
    }).sort({ dispatchedAt: 1 });

    if (reports.length === 0 && dispatches.length === 0) {
      return null;
    }

    // Combine into a chronological timeline
    const timeline = [];

    reports.forEach((r) => {
      timeline.push({
        type: r.extracted?.isDispatch ? 'DISPATCH_LOG' : 'FIELD_REPORT',
        source: r.source,
        sender: r.senderName,
        text: r.rawText,
        time: r.formattedTime || new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(r.timestamp).getTime(),
        reportId: r._id,
      });
    });

    dispatches.forEach((d) => {
      timeline.push({
        type: 'OFFICIAL_DISPATCH',
        source: 'HQ Dispatch Logistics',
        sender: d.vehicleInfo,
        text: `Dispatched ${d.quantity} ${d.unit} to ${shelter.name} via ${d.vehicleInfo}`,
        time: d.formattedTime || new Date(d.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(d.dispatchedAt).getTime(),
        dispatchId: d._id,
      });
    });

    // Sort timeline strictly by timestamp
    timeline.sort((a, b) => a.timestamp - b.timestamp);

    // Call Gemini (or fast deterministic reasoning for pre-seeded simulation)
    const analysis = isSimulation
      ? fallbackRuleReasoning(shelter.name, resourceCategory, timeline)
      : await runGeminiReasoning(shelter.name, resourceCategory, timeline);

    if (analysis && analysis.hasContradiction) {
      // Find or create active alert
      let alert = await Alert.findOne({
        shelterId: shelter._id,
        resourceCategory: resourceCategory,
        status: 'ACTIVE_UNRESOLVED',
      });

      const evidenceFormatted = timeline.map((item) => ({
        formattedTime: item.time,
        source: item.source,
        quote: item.text,
        badge: item.type === 'OFFICIAL_DISPATCH' ? 'Official Dispatch' : 'Field Report',
      }));

      if (!alert) {
        alert = new Alert({
          title: `${resourceCategory} Crisis at ${shelter.name}`,
          shelterId: shelter._id,
          shelterName: shelter.name,
          resourceCategory: resourceCategory,
          severity: analysis.severity || 'CRITICAL',
          conflictType: analysis.conflictType || 'DELIVERY_CONTRADICTION',
          aiExplanation: analysis.explanation,
          evidenceTimeline: evidenceFormatted,
          relatedReportIds: reports.map((r) => r._id),
          status: 'ACTIVE_UNRESOLVED',
        });
      } else {
        alert.aiExplanation = analysis.explanation;
        alert.evidenceTimeline = evidenceFormatted;
        alert.severity = analysis.severity || 'CRITICAL';
        alert.conflictType = analysis.conflictType || 'DELIVERY_CONTRADICTION';
        alert.relatedReportIds = reports.map((r) => r._id);
      }

      await alert.save();

      // Update shelter status to CRITICAL
      shelter.status = 'CRITICAL';
      await shelter.save();

      // Update associated Need status
      await Need.updateMany(
        { shelterId: shelter._id, resourceCategory: resourceCategory },
        { status: 'CONTRADICTION_FLAGGED' }
      );

      return alert;
    }

    return null;
  } catch (err) {
    console.error('[Contradiction Service] Error evaluating contradictions:', err.message);
    return null;
  }
}

async function runGeminiReasoning(shelterName, resourceCategory, timeline) {
  const gemini = getGeminiClient();

  if (gemini && timeline.length >= 2) {
    const modelsToTry = [GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(
      (m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx
    );

    const prompt = `You are ReliefGraph Reasoning Engine.
Analyze the chronological timeline of field reports and supply dispatches for "${shelterName}" regarding "${resourceCategory}".

Timeline:
${timeline.map((t, idx) => `${idx + 1}. [${t.time}] (${t.source}): "${t.text}"`).join('\n')}

Task:
Determine if there is a contradiction, supply deficit, or unverified delivery.
For example:
- A dispatch was recorded, but a subsequent field report states the supplies are still missing ("Still no water", "stuck in mud").
- The quantity dispatched is drastically below the reported need.
- A critical emergency is reported with zero dispatch response.

Respond ONLY with valid JSON (no markdown ticks):
{
  "hasContradiction": boolean,
  "conflictType": "DELIVERY_CONTRADICTION|QUANTITY_MISMATCH|DEPLETION_SURGE|UNMET_EMERGENCY",
  "severity": "CRITICAL|WARNING|INFO",
  "explanation": "Concise 2-sentence rationale citing specific times and quotes"
}`;

    for (const model of modelsToTry) {
      try {
        const response = await gemini.models.generateContent({
          model,
          contents: prompt,
        });

        let jsonText = response.text ? response.text.trim() : '';
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```\s*/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(jsonText);
        return parsed;
      } catch (err) {
        console.warn(`[Contradiction Service] Model ${model} reasoning failed: ${err.message}`);
      }
    }
  }

  // Heuristic rule-based conflict detector
  return fallbackRuleReasoning(shelterName, resourceCategory, timeline);
}

function fallbackRuleReasoning(shelterName, resourceCategory, timeline) {
  let hasDispatch = false;
  let dispatchIndex = -1;
  let hasPostDispatchDistress = false;
  let lastDistressQuote = '';
  let dispatchQuote = '';

  timeline.forEach((item, idx) => {
    const isDisp = item.type === 'OFFICIAL_DISPATCH' || item.text.toLowerCase().includes('dispatch') || item.text.toLowerCase().includes('sent');
    if (isDisp) {
      hasDispatch = true;
      dispatchIndex = idx;
      dispatchQuote = item.text;
    } else if (hasDispatch && idx > dispatchIndex) {
      const lower = item.text.toLowerCase();
      if (
        lower.includes('still no') ||
        lower.includes('not reached') ||
        lower.includes('haven\'t received') ||
        lower.includes('running low') ||
        lower.includes('shortage') ||
        lower.includes('urgent') ||
        lower.includes('no water') ||
        lower.includes('no food') ||
        lower.includes('no medicine') ||
        lower.includes('stuck') ||
        lower.includes('mud') ||
        lower.includes('only') ||
        lower.includes('deficit') ||
        lower.includes('no baby') ||
        lower.includes('no stove') ||
        lower.includes('cannot')
      ) {
        hasPostDispatchDistress = true;
        lastDistressQuote = item.text;
      }
    }
  });

  if (hasDispatch && hasPostDispatchDistress) {
    const lower = lastDistressQuote.toLowerCase();
    const isMismatch = lower.includes('only') || lower.includes('deficit') || lower.includes('exhausted') || lower.includes('no stove');
    return {
      hasContradiction: true,
      conflictType: isMismatch ? 'QUANTITY_MISMATCH' : 'DELIVERY_CONTRADICTION',
      severity: 'CRITICAL',
      explanation: isMismatch
        ? `Quantity / Supply Mismatch detected: Dispatch was logged ("${dispatchQuote}"), but subsequent field report at ${shelterName} reports ("${lastDistressQuote}").`
        : `Contradiction detected: Outbound delivery was logged ("${dispatchQuote}"), but a subsequent field report at ${shelterName} reports ("${lastDistressQuote}"). Supplies appear missing or stranded in transit.`,
    };
  }

  if (timeline.some((t) => t.text.toLowerCase().includes('insulin') || t.text.toLowerCase().includes('dying') || t.text.toLowerCase().includes('critical') || t.text.toLowerCase().includes('shock'))) {
    return {
      hasContradiction: true,
      conflictType: 'UNMET_EMERGENCY',
      severity: 'CRITICAL',
      explanation: `Urgent life-threatening emergency shortage flagged at ${shelterName}. Immediate dispatch required.`,
    };
  }

  return {
    hasContradiction: false,
    conflictType: 'DELIVERY_CONTRADICTION',
    severity: 'INFO',
    explanation: 'No conflict detected; reports align with expected logistics.',
  };
}
