// Type definitions as JSDoc comments for better IDE support

/**
 * @typedef {Object} GeminiLiveConfig
 * @property {string} endpoint
 * @property {string} [token]
 * @property {number} [sampleRate]
 * @property {boolean} [debug]
 * @property {number} [reconnectAttempts]
 * @property {number} [reconnectDelay]
 */

/**
 * @typedef {Object} AudioChunk
 * @property {string} data
 * @property {number} timestamp
 */

/**
 * @typedef {Object} TranscriptionData
 * @property {string} text
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ToolCall
 * @property {string} name
 * @property {Record<string, any>} parameters
 * @property {string} [id]
 */

/**
 * @typedef {Object} MediaConstraints
 * @property {boolean|MediaTrackConstraints} [video]
 * @property {boolean|MediaTrackConstraints} [audio]
 */

/**
 * @typedef {Object} ConnectionState
 * @property {'disconnected'|'connecting'|'connected'|'error'} status
 * @property {string} [error]
 * @property {number} [reconnectAttempt]
 */

/**
 * @typedef {Object} VolumeData
 * @property {number} level
 * @property {number} timestamp
 */

/**
 * @typedef {function(any): void} EventCallback
 */

/**
 * @typedef {Object} GeminiLiveEvents
 * @property {function(): void} setupComplete
 * @property {EventCallback<string>} audioReceived
 * @property {EventCallback<string>} transcriptionUpdate
 * @property {EventCallback<ToolCall>} toolCall
 * @property {function(): void} interrupted
 * @property {function(): void} turnComplete
 * @property {EventCallback<Error>} error
 * @property {EventCallback<{code: number, reason: string}>} close
 * @property {EventCallback<ConnectionState>} connectionStateChange
 * @property {function(): void} recordingStarted
 * @property {function(): void} recordingStopped
 * @property {EventCallback<boolean>} muteToggled
 * @property {EventCallback<VolumeData>} volumeUpdate
 */

export {};