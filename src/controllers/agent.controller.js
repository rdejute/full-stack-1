/* *********************
 * THIRD-PARTY LIBRARIES
 ***********************/
import mongoose from 'mongoose';

/* **************************
 * SCHEMAS IMPORT
 ****************************/
import agentSchema from '../shared/db/mongodb/schemas/agent.schema.js';

/* **************
 * ROUTE HANDLERS
 ****************/
/**
 * GET - /email-list
 * Returns a comma-separated list of all agent emails
 */
const agentEmailList = async (_req, res) => {
    try {
        // Retrieve all agents sorted by email
        const agentsSorted = await agentSchema.find({}).sort({ email: 1 });

        // Check if agents are found
        if (!Array.isArray(agentsSorted) || agentsSorted.length === 0) {
            return res.status(404).json({ error: 'No agents available' });
        }

        // Extract and compile email list
        const emails = agentsSorted
            .filter(agent => agent?.email?.trim())
            .map(agent => agent.email.trim());

        // Check if any valid emails were found
        if (emails.length === 0) return res.status(404).json({ error: 'No valid emails found' });

        res.status(200).send(emails.join(", "));
    } catch (error) {
        console.error('Error in status endpoint:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};

/**
 * POST - /agent-create
 * Creates a new agent with required fields: first_name, last_name, email, region
 */
const createAgent = async (req, res) => {
    try {
        // Extract and validate required fields from request body
        const { first_name, last_name, email, region } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !region) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                message: 'first_name, last_name, email, and region are required' 
            });
        }

        // Validate region value
        const validRegions = ['north', 'south', 'east', 'west'];
        if (!validRegions.includes(region.toLowerCase())) {
            return res.status(400).json({ 
                error: 'Invalid region',
                message: `Region must be one of: ${validRegions.join(', ')}` 
            });
        }

        // Check for existing agent with the same email
        const existingAgent = await agentSchema.findOne({ email: email.toLowerCase() });
        if (existingAgent) {
            return res.status(409).json({ 
                error: 'Agent already exists',
                message: 'An agent with this email already exists' 
            });
        }

        // Create new agent
        const agent = await agentSchema.create({
            first_name,
            last_name, 
            email: email.toLowerCase(), 
            region: region.toLowerCase(), 
            sales: 0, 
            ...req.body
        });
        
        res.status(201).json({ 
            message: 'Agent created successfully',
            data: agent 
        });
    } catch (error) {
        console.error('CreateAgent error:', error.message);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed',
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: 'Agent already exists',
                message: 'An agent with this email already exists' 
            });
        }
        
        res.status(500).json({ 
            error: 'Server error creating agent',
            message: error.message 
        });
    }
};

/**
 * GET - /agents
 * Returns all agents sorted alphabetically by last_name
 */
const getAllAgents = async (_req, res) => {
    try {
        // Retrieve all agents sorted by last_name
        const agentsSorted = await agentSchema.find({}).sort({ last_name: 1 });
        
        // Check if agents are found
        if (agentsSorted.length === 0) {
            return res.status(404).json({ 
                error: 'No agents found',
                message: 'No agents are currently in the system' 
            });
        }

        res.status(200).json({ 
            message: 'Agents retrieved successfully',
            data: agentsSorted 
        });
    } catch (error) {
        console.error('GetAllAgents error:', error.message);
        res.status(500).json({ error: 'Server error retrieving agents' });
    }
};

/**
 * GET - /agents-by-region
 * Returns all agents in a specific region, sorted by rating (descending)
 */
const getAgentsByRegion = async (req, res) => {
    try {
        // Extract and validate region query parameter
        const region = req.query.region?.toLowerCase();
        
        // Check for missing region
        if (!region) {
            return res.status(400).json({ 
                error: 'Region parameter is required',
                message: 'Please provide a region query parameter' 
            });
        }

        // Validate region name
        const validRegions = ['north', 'south', 'east', 'west'];
        if (!validRegions.includes(region)) {
            return res.status(400).json({ 
                error: 'Invalid region',
                message: `Region must be one of: ${validRegions.join(', ')}` 
            });
        }

        // Find agents in the specified region sorted by rating
        const agentsSorted = await agentSchema.find({ region }).sort({ rating: -1 });
        
        // Check if any agents found in the region
        if (agentsSorted.length === 0) {
            return res.status(404).json({ 
                error: `No agents found in region: ${region}`,
                message: `No agents are currently assigned to the ${region} region` 
            });
        }

        res.status(200).json({ 
            message: `Agents in ${region} region retrieved successfully`,
            data: agentsSorted 
        });
    } catch (error) {
        console.error('GetAgentsByRegion error:', error.message);
        res.status(500).json({ error: 'Server error retrieving agents by region' });
    }
};

/**
 * PATCH - /agent-update-info/:id
 * Updates agent information (allowed fields: first_name, last_name, email, region)
 */
const updateAgentInfo = async (req, res) => {
    try {
        // Extract agent ID from URL parameters, query, or body
        const agentId = req.params.id || req.query.id || req.body.id;
        
        // Validate agent ID presence and format
        if (!agentId) {
            return res.status(400).json({ 
                error: 'Agent ID is required',
                message: 'Please provide an agent ID in the URL parameters' 
            });
        }

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({ 
                error: 'Invalid agent ID format',
                message: 'Please provide a valid MongoDB ObjectId' 
            });
        }

        // Check if agent exists
        const existingAgent = await agentSchema.findById(agentId);
        if (!existingAgent) {
            return res.status(404).json({ 
                error: 'Agent not found',
                message: `No agent with ID ${agentId}` 
            });
        }

        // Prepare update data with allowed fields only
        const allowedFields = ['first_name', 'last_name', 'email', 'region'];
        const updateData = {};
        
        // Filter request body for allowed fields
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        // Check if there are valid fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                error: 'No valid fields to update',
                message: `Only the following fields can be updated: ${allowedFields.join(', ')}` 
            });
        }

        // Update agent information
        const agent = await agentSchema.findByIdAndUpdate(
            agentId, 
            updateData, 
            { new: true, runValidators: true }
        );

        // Final check if agent was updated
        if (!agent) {
            return res.status(404).json({ 
                error: 'Agent not found',
                message: `No agent with ID ${agentId}` 
            });
        }

        res.status(200).json({ 
            message: 'Agent updated successfully',
            data: agent 
        });
    } catch (error) {
        console.error('UpdateAgentInfo error:', error.message);
        res.status(500).json({ 
            error: 'Server error updating agent',
            message: error.message 
        });
    }
};

/**
 * DELETE - /agent-delete
 * Deletes an agent based on filter parameters (query or body)
 */
const deleteAgent = async (req, res) => {
    try {
        // Combine query and body parameters for filtering
        const filterParams = { ...req.query, ...req.body };

        // Validate presence of filter parameters
        if (!filterParams || Object.keys(filterParams).length === 0) {
            return res.status(400).json({ 
                error: 'No parameters provided',
                message: 'Please specify valid filter parameters (in query or body) to delete an agent' 
            });
        }

        // Find agents matching the filter parameters
        const agents = await agentSchema.find(filterParams);

        // Validate that exactly one agent matches the criteria
        if (agents.length === 0) {
            return res.status(404).json({ 
                error: 'No agent found',
                message: 'No agent found matching the provided parameters' 
            });
        }

        // If multiple agents match, return an error
        if (agents.length > 1) {
            return res.status(400).json({ 
                error: 'Multiple agents matched',
                message: `Multiple agents (${agents.length}) matched the query. Please provide more specific parameters to identify a single agent` 
            });
        }

        // Delete the matched agent
        const agentToDelete = agents[0];
        await agentSchema.deleteOne({ _id: agentToDelete._id });

        res.status(200).json({ 
            message: 'Agent deleted successfully',
            data: agentToDelete 
        });

    } catch (error) {
        console.error('DeleteAgent error:', error.message);
        res.status(500).json({ error: 'Server error deleting agent' });
    }
};

/* *******
 * EXPORTS
 *********/
export default {
    agentEmailList,
    createAgent,
    getAllAgents,
    getAgentsByRegion,
    updateAgentInfo,
    deleteAgent
};