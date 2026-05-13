export class AppApiError extends Error {
	code?: string;

	constructor(message: string, code?: string) {
		super(message);
		this.name = "AppApiError";
		this.code = code;
	}
}

export function throwIfSupabaseError(error: {
	message: string;
	code?: string;
} | null): void {
	if (error) {
		throw new AppApiError(error.message, error.code);
	}
}