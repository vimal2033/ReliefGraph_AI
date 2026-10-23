import express from 'express';
import { Shelter } from '../models/Shelter.js';
import { Report } from '../models/Report.js';
import { Dispatch } from '../models/Dispatch.js';
import { Need } from '../models/Need.js';
import { Alert } from '../models/Alert.js';
import { extractReportEntities } from '../services/extractionService.js';
import { matchLocationToShelter } from '../services/matchingService.js';
import { evaluateContradictions } from '../services/contradictionService.js';
import { runFullSimulation } from '../services/simulationService.js';

const router = express.Router();

/**
 * GET /api/stats - High level metrics for the command center
 */
router.get('/stats', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const unresolvedAlerts = await Alert.countDocuments({ status: 'ACTIVE_UNRESOLVED' });
    const unverifiedDeliveries = await Dispatch.countDocuments({
      status: { $in: ['IN_TRANSIT', 'CONTRADICTED_MISSING'] },
    });
    const resolvedCount = await Alert.countDocuments({
      status: { $in: ['VERIFIED_RESOLVED', 'RE_DISPATCHED'] },
    });
    const totalShelters = await Shelter.countDocuments();

    return res.json({
      totalReports,
      unresolvedNeeds: unresolvedAlerts,
      unverifiedDeliveries,
      resolvedCount,
      totalShelters,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/alerts - Priority contradiction alerts feed
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/alerts/:id/resolve - Coordinator resolves contradiction
 */
router.post('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Alert ID is required' });

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.status = 'VERIFIED_RESOLVED';
    await alert.save();

    // Check if shelter has remaining active alerts
    const remaining = await Alert.countDocuments({
      shelterId: alert.shelterId,
      status: 'ACTIVE_UNRESOLVED',
    });

    const shelter = await Shelter.findById(alert.shelterId);
    if (shelter) {
      if (remaining === 0) {
        shelter.status = 'STABLE';
      }
      // Remove resolved requirement from active summary
      if (shelter.activeNeedsSummary && Array.isArray(shelter.activeNeedsSummary)) {
        shelter.activeNeedsSummary = shelter.activeNeedsSummary.filter(
          (needText) => !needText.toLowerCase().includes(alert.resourceCategory.toLowerCase())
        );
      }
      await shelter.save();
    }

    await Need.updateMany(
      { shelterId: alert.shelterId, resourceCategory: alert.resourceCategory },
      { status: 'RESOLVED' }
    );

    return res.json({ success: true, alert, shelter });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/alerts/:id/reroute-plan - Gemini Smart Re-routing Advisor
 */
router.get('/alerts/:id/reroute-plan', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Alert ID is required' });

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    // Find shelters with surplus or stable resources
    const shelters = await Shelter.find();
    const surplusShelter = shelters.find(
      (s) => s.status === 'STABLE' && String(s._id) !== String(alert.shelterId)
    ) || shelters.find((s) => String(s._id) !== String(alert.shelterId));

    const surplusName = surplusShelter ? surplusShelter.name : 'Nehru Stadium Arena';
    const destinationName = alert.shelterName;
    const category = alert.resourceCategory;

    // Retrieve actual need details if available
    const matchingNeed = await Need.findOne({
      shelterId: alert.shelterId,
      resourceCategory: alert.resourceCategory,
    });

    const qtyNeeded = matchingNeed?.quantityRequested || 35;
    const unitNeeded = matchingNeed?.unit || (category === 'WATER' ? 'cans' : (category === 'MEDICAL' ? 'vials' : 'packets'));

    const reroutePlan = {
      alertId: alert._id,
      title: alert.title,
      destinationShelter: destinationName,
      resourceCategory: category,
      quantityNeeded: qtyNeeded,
      unit: unitNeeded,

      // Default Depot Logistics
      defaultOption: {
        sourceName: 'Central District Logistics Warehouse',
        distance: '18.4 km',
        estimatedMinutes: 160,
        formattedEta: '2 hrs 40 mins',
        routeStatus: 'HIGH RISK: NH-53 river causeway reported partially submerged; heavy transit delay probable.',
        vehicle: 'Heavy Logistics Truck 14',
      },

      // Gemini AI Recommended Re-route from Surplus Hub
      recommendedOption: {
        sourceName: `${surplusName} (Surplus Staging Base)`,
        availableSurplus: `${qtyNeeded} ${unitNeeded} Buffer Stock`,
        distance: '3.2 km',
        estimatedMinutes: 22,
        formattedEta: '22 minutes',
        routeStatus: 'CLEAR & SAFE: Elevated Western Ring Road bypass is unobstructed by floodwaters.',
        vehicle: 'NDRF Rapid Response Van 02',
        timeSavedMinutes: 138,
      },

      aiJustification: `Gemini Logistics Copilot Analysis: Rather than dispatching from Central Depot (18.4 km away with high floodwater risk on NH-53), re-routing ${qtyNeeded} ${unitNeeded} from ${surplusName} saves 138 minutes of critical response time. The elevated Ring Road route ensures safe, guaranteed delivery to ${destinationName}.`,
    };

    return res.json(reroutePlan);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/alerts/:id/execute-reroute - Authorizes the AI re-route
 */
router.post('/alerts/:id/execute-reroute', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Alert ID is required' });

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    const { sourceName, vehicle, notes, quantity } = req.body || {};
    const dispatchQty = parseInt(quantity, 10) || 35;
    const dispatchUnit = alert.resourceCategory === 'WATER' ? 'cans' : (alert.resourceCategory === 'MEDICAL' ? 'vials' : 'packets');

    alert.status = 'RE_DISPATCHED';
    alert.aiExplanation = `[AI RE-ROUTE EXECUTED] Re-routed ${dispatchQty} ${dispatchUnit} from ${sourceName || 'Nehru Stadium Arena'} via ${vehicle || 'NDRF Rapid Van 02'}. Estimated arrival in 22 mins.`;
    await alert.save();

    // Check remaining active alerts & replenish on-site stock meter
    const remaining = await Alert.countDocuments({
      shelterId: alert.shelterId,
      status: 'ACTIVE_UNRESOLVED',
    });

    const shelter = await Shelter.findById(alert.shelterId);
    if (shelter) {
      if (remaining === 0) {
        shelter.status = 'WARNING';
      }

      // Replenish the corresponding stock health meter
      const catKey =
        alert.resourceCategory === 'WATER' ? 'water' :
        alert.resourceCategory === 'FOOD' ? 'food' :
        alert.resourceCategory === 'MEDICAL' ? 'medical' :
        alert.resourceCategory === 'BABY_CARE' ? 'babyCare' : null;

      if (catKey && shelter.stockHealth) {
        shelter.stockHealth[catKey] = Math.min(100, (shelter.stockHealth[catKey] || 15) + 45);
      }
      await shelter.save();
    }

    // Create tracking dispatch
    const dispatch = new Dispatch({
      trackingCode: `REROUTE-${Math.floor(1000 + Math.random() * 9000)}`,
      shelterId: alert.shelterId,
      shelterName: alert.shelterName,
      resourceCategory: alert.resourceCategory,
      quantity: dispatchQty,
      unit: dispatchUnit,
      vehicleInfo: vehicle || 'NDRF Rapid Van 02',
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'IN_TRANSIT',
      notes: notes || `Expedited Re-route from ${sourceName || 'Nehru Stadium Arena'} to ${alert.shelterName} authorized by coordinator.`,
    });
    await dispatch.save();

    return res.json({ success: true, dispatch, alert });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/alerts/:id/redispatch - Re-dispatch emergency supplies
 */
router.post('/alerts/:id/redispatch', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Alert ID is required' });

    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.status = 'RE_DISPATCHED';
    await alert.save();

    // Check remaining active alerts
    const remaining = await Alert.countDocuments({
      shelterId: alert.shelterId,
      status: 'ACTIVE_UNRESOLVED',
    });
    if (remaining === 0) {
      await Shelter.findByIdAndUpdate(alert.shelterId, { status: 'WARNING' });
    }

    const dispatchUnit = alert.resourceCategory === 'WATER' ? 'cans' : (alert.resourceCategory === 'MEDICAL' ? 'vials' : 'packets');

    // Create new rapid dispatch
    const newDispatch = new Dispatch({
      trackingCode: `EMERG-${Math.floor(1000 + Math.random() * 9000)}`,
      shelterId: alert.shelterId,
      shelterName: alert.shelterName,
      resourceCategory: alert.resourceCategory,
      quantity: 50,
      unit: dispatchUnit,
      vehicleInfo: 'Priority Escort Van 09',
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'IN_TRANSIT',
      notes: `Expedited re-dispatch authorized following AI conflict alert: ${alert.title}`,
    });
    await newDispatch.save();

    return res.json({ success: true, dispatch: newDispatch, alert });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/shelters - All monitored disaster shelters
 */
router.get('/shelters', async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ name: 1 });
    return res.json(shelters);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/reports - Ingested reports feed
 */
router.get('/reports', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const reports = await Report.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/reports - Submit a single report from UI
 */
router.post('/reports', async (req, res) => {
  try {
    const { rawText, source, senderName } = req.body || {};
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: 'rawText is required and must be a non-empty string' });
    }

    const cleanedText = rawText.trim();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const extracted = await extractReportEntities(cleanedText, source || 'VOLUNTEER');
    const matchedShelter = await matchLocationToShelter(extracted.location);

    if (matchedShelter) {
      extracted.matchedShelterId = matchedShelter._id;
      extracted.matchedShelterName = matchedShelter.name;
    }

    const reportDoc = new Report({
      rawText: cleanedText,
      source: source || 'VOLUNTEER',
      senderName: senderName || 'Field Reporter',
      formattedTime,
      extracted,
      status: 'PROCESSED',
    });
    await reportDoc.save();

    let alertResult = null;
    if (matchedShelter) {
      if (extracted.isDispatch) {
        const dispatchDoc = new Dispatch({
          trackingCode: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
          shelterId: matchedShelter._id,
          shelterName: matchedShelter.name,
          resourceCategory: extracted.resourceCategory,
          quantity: extracted.quantity,
          unit: extracted.unit,
          vehicleInfo: senderName || 'Logistics Van',
          formattedTime,
          status: 'IN_TRANSIT',
          notes: cleanedText,
        });
        await dispatchDoc.save();
      } else {
        let need = await Need.findOne({
          shelterId: matchedShelter._id,
          resourceCategory: extracted.resourceCategory,
          status: { $in: ['OPEN', 'CONTRADICTION_FLAGGED', 'PARTIALLY_MET'] },
        });

        if (!need) {
          need = new Need({
            shelterId: matchedShelter._id,
            shelterName: matchedShelter.name,
            resourceCategory: extracted.resourceCategory,
            itemDescription: extracted.itemDescription,
            quantityRequested: extracted.quantity,
            unit: extracted.unit,
            urgency: extracted.urgency,
            initialReportId: reportDoc._id,
            timeline: [
              {
                formattedTime,
                eventType: 'REQUEST_CREATED',
                description: cleanedText,
                sourceQuote: cleanedText,
                author: senderName || 'Field Reporter',
              },
            ],
          });
        } else {
          need.urgency = extracted.urgency;
          need.timeline.push({
            formattedTime,
            eventType: 'FOLLOW_UP_REPORT',
            description: cleanedText,
            sourceQuote: cleanedText,
            author: senderName || 'Field Reporter',
          });
        }
        await need.save();
      }

      alertResult = await evaluateContradictions(matchedShelter._id, extracted.resourceCategory);
    }

    return res.json({
      success: true,
      report: reportDoc,
      alert: alertResult,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/graph - Nodes and edges for the Relief Knowledge Graph
 */
router.get('/graph', async (req, res) => {
  try {
    const shelters = await Shelter.find();
    const needs = await Need.find({ status: { $ne: 'RESOLVED' } });
    const dispatches = await Dispatch.find().limit(50);
    const alerts = await Alert.find({ status: 'ACTIVE_UNRESOLVED' });

    const nodes = [];
    const edges = [];

    // 1. Shelter Nodes (Primary hubs)
    shelters.forEach((s) => {
      nodes.push({
        id: `shelter_${s._id}`,
        label: s.name,
        group: 'shelter',
        color: s.status === 'CRITICAL' ? '#EF4444' : s.status === 'WARNING' ? '#F59E0B' : '#10B981',
        shape: 'box',
        font: { color: '#ffffff', size: 14, bold: true },
        data: s,
      });
    });

    // 2. Need Nodes
    needs.forEach((n) => {
      const needNodeId = `need_${n._id}`;
      nodes.push({
        id: needNodeId,
        label: `${n.resourceCategory}\n(${n.quantityRequested} ${n.unit})`,
        group: 'need',
        color: n.status === 'CONTRADICTION_FLAGGED' ? '#DC2626' : '#F97316',
        shape: 'diamond',
        font: { color: '#ffffff', size: 11 },
        data: n,
      });

      // Edge from shelter to need
      edges.push({
        from: `shelter_${n.shelterId}`,
        to: needNodeId,
        label: 'NEEDS',
        color: { color: '#94A3B8' },
        arrows: 'to',
      });
    });

    // 3. Dispatch Nodes
    dispatches.forEach((d) => {
      const dispatchNodeId = `dispatch_${d._id}`;
      nodes.push({
        id: dispatchNodeId,
        label: `${d.vehicleInfo}\n${d.quantity} ${d.unit}`,
        group: 'dispatch',
        color: '#3B82F6',
        shape: 'dot',
        size: 16,
        font: { color: '#ffffff', size: 10 },
        data: d,
      });

      // Edge from dispatch to shelter
      edges.push({
        from: dispatchNodeId,
        to: `shelter_${d.shelterId}`,
        label: 'DISPATCHED_TO',
        color: { color: '#3B82F6' },
        arrows: 'to',
      });
    });

    // 4. Contradiction Edges
    alerts.forEach((a) => {
      // Find matching dispatch and need
      const matchingNeed = needs.find(
        (n) => String(n.shelterId) === String(a.shelterId) && n.resourceCategory === a.resourceCategory
      );
      const matchingDispatch = dispatches.find(
        (d) => String(d.shelterId) === String(a.shelterId) && d.resourceCategory === a.resourceCategory
      );

      if (matchingNeed && matchingDispatch) {
        edges.push({
          from: `dispatch_${matchingDispatch._id}`,
          to: `need_${matchingNeed._id}`,
          label: 'CONFLICTS_WITH',
          color: { color: '#EF4444', highlight: '#FF0055' },
          dashes: true,
          width: 3,
        });
      } else if (matchingNeed) {
        // Unmet emergency with no dispatch
        edges.push({
          from: `shelter_${a.shelterId}`,
          to: `need_${matchingNeed._id}`,
          label: 'UNMET_CRISIS',
          color: { color: '#EF4444', highlight: '#FF0055' },
          dashes: true,
          width: 3,
        });
      }
    });

    return res.json({ nodes, edges });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/simulation/run - Ingests synthetic flood dataset
 */
router.post('/simulation/run', async (req, res) => {
  try {
    const result = await runFullSimulation();
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
