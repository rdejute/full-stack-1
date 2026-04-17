import agentController from '../../controllers/agent.controller.js';
import { validateRegion } from '../../shared/middleware/regionValidator.js';
import { validateAgentCreation, validateObjectId, validateAgentUpdate } from '../../shared/middleware/agentValidator.js';

const agentRoutesEndpoint = (app) => {
    app.get('/email-list', agentController.agentEmailList);
    app.post('/agent-create', validateAgentCreation, agentController.createAgent);
    app.get('/agents', agentController.getAllAgents);
    app.get('/agents-by-region/:region', validateRegion, agentController.getAgentsByRegion);
    app.get('/agents-by-region', validateRegion, agentController.getAgentsByRegion);
    app.patch('/agent-update-info/:id', validateObjectId, validateAgentUpdate, agentController.updateAgentInfo);
    app.patch('/agent-update-info/', validateObjectId, validateAgentUpdate, agentController.updateAgentInfo);
    app.delete('/agent-delete', agentController.deleteAgent);
}

/* *******
 * EXPORTS
 *********/
export default { agentRoutesEndpoint };