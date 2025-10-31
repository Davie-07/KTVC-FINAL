// Utility to normalize API response shapes into arrays
function ensureArray(respData, knownKeys = ['data', 'payments', 'users', 'items']) {
	// If already an array, return it
	if (Array.isArray(respData)) return respData;

	// If it's an object, try known keys that may contain the array
	if (respData && typeof respData === 'object') {
		for (const key of knownKeys) {
			if (Array.isArray(respData[key])) return respData[key];
		}
	}

	// Fallback: return empty array
	return [];
}

module.exports = { ensureArray };
