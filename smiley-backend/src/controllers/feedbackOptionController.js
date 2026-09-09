import { FeedbackOption } from '../models/FeedbackOption.js';
import { Rating } from '../models/Rating.js';
import { success, AppError } from '../utils/response.js';

function duplicateFeedbackOption(res) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: [{ field: 'label', message: 'Feedback option already exists for this rating' }],
  });
}

async function validateRating(ratingId) {
  const rating = await Rating.findById(ratingId);
  if (!rating || rating.status !== 'active') throw new AppError('Rating is unavailable', 400);
}

export async function listFeedbackOptions(req, res) {
  return success(res, await FeedbackOption.list(req.validated?.query));
}

export async function listAllFeedbackOptions(req, res) {
  return success(res, await FeedbackOption.list({ ...req.validated?.query, includeInactive: true }));
}

export async function createFeedbackOption(req, res) {
  await validateRating(req.validated.body.ratingId);
  if (await FeedbackOption.findDuplicateLabel(req.validated.body)) return duplicateFeedbackOption(res);
  return success(res, await FeedbackOption.create(req.validated.body), 'Feedback option created', 201);
}

export async function updateFeedbackOption(req, res) {
  const { id } = req.validated.params;
  if (!await FeedbackOption.findById(id)) throw new AppError('Feedback option not found', 404);
  await validateRating(req.validated.body.ratingId);
  if (await FeedbackOption.findDuplicateLabel(req.validated.body, id)) return duplicateFeedbackOption(res);
  return success(res, await FeedbackOption.update(id, req.validated.body), 'Feedback option updated');
}

export async function deleteFeedbackOption(req, res) {
  const { id } = req.validated.params;
  if (!await FeedbackOption.findById(id)) throw new AppError('Feedback option not found', 404);
  await FeedbackOption.deactivate(id);
  return success(res, null, 'Feedback option deactivated');
}