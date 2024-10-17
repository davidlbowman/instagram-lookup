async function getInstagramFollowers(instagramId: string): Promise<number> {
	try {
		const response = await fetch(`https://www.instagram.com/${instagramId}/`)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const html = await response.text()
		const followerMatch = html.match(
			/<meta property="og:description" content="([^"]*?)"/,
		)
		if (!followerMatch) {
			throw new Error("Could not find follower count in the HTML")
		}

		const followerCountMatch = followerMatch[1].match(
			/(\d+(?:\.\d+)?[KkMm]?) Followers/,
		)

		if (!followerCountMatch) {
			throw new Error(
				"Could not extract follower count from the matched string",
			)
		}

		return parseFollowerCount(followerCountMatch[1])
	} catch (error) {
		console.error("Error fetching Instagram followers:", error)
		return -1
	}
}

function parseFollowerCount(count: string): number {
	if (count.toLowerCase().includes("k")) {
		return Math.round(
			Number.parseFloat(count.toLowerCase().replace("k", "")) * 1000,
		)
	}

	if (count.toLowerCase().includes("m")) {
		return Math.round(
			Number.parseFloat(count.toLowerCase().replace("m", "")) * 1000000,
		)
	}

	return Math.round(Number.parseFloat(count))
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
const instagramIds = [
	"tidescommunity",
	"cacoalition4rf",
	"google",
	"causeErrorsdkjkdsj",
]

getMultipleInstagramData(instagramIds)
	.then((data) => {
		console.log(JSON.stringify(data, null, 2))
	})
	.catch((error) => {
		console.error("An unexpected error occurred:", error)
	})
