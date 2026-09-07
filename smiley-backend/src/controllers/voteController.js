import { submitVote } from '../services/voteService.js';
import { Vote } from '../models/Vote.js';
import { success } from '../utils/response.js';
export async function createVote(req, res) { return success(res, await submitVote(req.validated.body), 'Thank you for your feedback!', 201); }
export async function listVotes(req, res) { return success(res, await Vote.list(req.validated.query)); }
