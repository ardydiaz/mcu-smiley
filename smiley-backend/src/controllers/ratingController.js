import { Rating } from '../models/Rating.js';
import { success } from '../utils/response.js';
export async function listRatings(req, res) { return success(res, await Rating.list()); }
