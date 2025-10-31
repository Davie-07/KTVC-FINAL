export function ensureArray(respData, knownKeys = ['data', 'payments', 'users', 'items']) {
	// Already an array
	if (Array.isArray(respData)) return respData;

	// Null / undefined
	if (respData == null) return [];

	// If the response is an object, try known keys
	if (typeof respData === 'object') {
		for (const key of knownKeys) {
			if (Array.isArray(respData[key])) return respData[key];
		}

		// nested data: { data: { items: [...] } }
		if (respData.data && typeof respData.data === 'object') {
			for (const key of knownKeys) {
				if (Array.isArray(respData.data[key])) return respData.data[key];
			}
		}

		// If it's an iterable (Set, Map values), convert to array
		if (typeof respData[Symbol.iterator] === 'function') {
			try { return Array.from(respData); } catch (e) { /* ignore */ }
		}
	}

	// fallback: empty array
	return [];
}

module.exports = { ensureArray };
