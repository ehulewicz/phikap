import { z } from "zod";

export const PaginationMeta = z.object({
	page: z.number(),
	page_size: z.number(),
	total: z.number(),
	total_pages: z.number(),
});
