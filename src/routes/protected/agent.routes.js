/* *******************
 * CONTROLLERS IMPORT
 *********************/
import agentController from '../../controllers/agent.controller.js';

/* *******************
 * ROUTE CONFIGURATION
 *********************/
const agentRoutesEndpoint = (app) => {
    app.get('/email-list', agentController.agentEmailList);
    app.post('/agent-create', agentController.createAgent);
    app.get('/agents', agentController.getAllAgents);
    app.get('/agents-by-region', agentController.getAgentsByRegion);
    app.patch('/agent-update-info/:id', agentController.updateAgentInfo); // for id URL params
    app.patch('/agent-update-info/', agentController.updateAgentInfo); // for id Query/Body params
    app.delete('/agent-delete', agentController.deleteAgent);
}

/* *******
 * EXPORTS
 *********/
export default { agentRoutesEndpoint };