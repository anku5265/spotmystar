import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getRolePermissions, getAllRoles, getRoutesConfig } from '../middleware/permissions.js';

const router = express.Router();

// GET /api/permissions/roles — all roles
router.get('/roles', getAllRoles);

// GET /api/permissions/role/:role — permissions for a role
router.get('/role/:role', verifyToken, getRolePermissions);

// GET /api/permissions/routes — routes config (optional query: ?role=artist)
router.get('/routes', getRoutesConfig);

export default router;
