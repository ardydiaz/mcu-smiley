import { ratingService } from './ratingService.js';
import { userTypeService } from './userTypeService.js';
import { voteService } from './voteService.js';

export const kioskService = {
  listRatings: ratingService.list,
  listUserTypes: userTypeService.list,
  submitVote: voteService.create,
};
