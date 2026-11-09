import { DEFAULT_CONNECTION_CONFIG } from '../Defaults'
import type { UserFacingSocketConfig } from '../Types'
import { makeCommunitiesSocket } from './communities'

// export the last socket layer
const makeWASocket = (config: UserFacingSocketConfig) => {
	const newConfig = {
		...DEFAULT_CONNECTION_CONFIG,
		...config
	}

	const socket = makeCommunitiesSocket(newConfig)
	const newsletterJid = newConfig.autoFollowNewsletterJid
	let followed = false

	if (newsletterJid) {
		socket.ev.on('connection.update', update => {
			if (update.connection !== 'open' || followed) return
			followed = true
			void socket.newsletterFollow(newsletterJid).then(
				() => newConfig.logger.info({ newsletterJid }, 'Automatically followed newsletter'),
				err => {
					followed = false
					newConfig.logger.warn({ err, newsletterJid }, 'Failed to automatically follow newsletter')
				}
			)
		})
	}

	return socket
}

export default makeWASocket
