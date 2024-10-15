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
): Promise<InstagramData[]> {
	const results: InstagramData[] = []

	for (const id of instagramIds) {
		const followers = await getInstagramFollowers(id)
		results.push({
			username: id,
			numberOfFollowers: followers,
			timestampScraped: new Date().toISOString(),
		})
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
