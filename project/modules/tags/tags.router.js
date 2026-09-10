import { Router } from 'express';
import { createTagController, getTagsController } from './tags.controller.js';
import { validateCreateTag } from './tags.validator.js';

const router = Router();

router.post('/', validateCreateTag, createTagController);
router.get('/', getTagsController);

export default router;