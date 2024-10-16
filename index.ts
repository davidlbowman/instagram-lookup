async function getInstagramFollowers(instagramId: string): Promise<number> {
	try {
		const response = await fetch(`https://www.instagram.com/${instagramId}/`)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const html = await response.text()

		// Extract the follower count from the meta tag
		const followerMatch = html.match(
			/<meta property="og:description" content="(.*?) Followers/,
		)
		if (!followerMatch) {
			throw new Error("Could not find follower count in the HTML")
		}

		const followerCount = followerMatch[1].replace(/,/g, "")
		return Number.parseInt(followerCount, 10)
	} catch (error) {
		console.error("Error fetching Instagram followers:", error)
		return -1
	}
}

interface InstagramData {
	username: string
	numberOfFollowers: number
	timestampScraped: string
}

async function getMultipleInstagramData(
	instagramIds: string[],
	minDelayMs = 200,
	maxDelayMs = 1000,
	timeoutMs = 10000,
): Promise<InstagramData[]> {
	const results: InstagramData[] = []

	for (const id of instagramIds) {
		try {
			// Wrap the getInstagramFollowers call in a timeout
			const followersPromise = new Promise<number>((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error(`Timeout fetching data for ${id}`))
				}, timeoutMs)

				getInstagramFollowers(id)
					.then((followers) => {
						clearTimeout(timeoutId)
						resolve(followers)
					})
					.catch(reject)
			})

			const followers = await followersPromise

			results.push({
				username: id,
				numberOfFollowers: followers,
				timestampScraped: new Date().toISOString(),
			})

			// Generate a random delay between minDelayMs and maxDelayMs
			const randomDelay =
				Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs
			await new Promise((resolve) => setTimeout(resolve, randomDelay))
		} catch (error) {
			console.error(`Error fetching data for ${id}:`, error)
			results.push({
				username: id,
				numberOfFollowers: -1,
				timestampScraped: new Date().toISOString(),
			})
		}
	}

	return results
}

// Example usage
const instagramIds = ["instagram", "cacoalition4rf"]

getMultipleInstagramData(instagramIds)
	.then((data) => {
		console.log(JSON.stringify(data, null, 2))
	})
	.catch((error) => {
		console.error("An unexpected error occurred:", error)
	})
