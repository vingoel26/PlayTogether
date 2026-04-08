export class WatchSyncEngine {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.state = {
            url: null,
            playing: false,
            currentTime: 0,
            updatedAt: Date.now(),
            queue: []
        };
    }

    getState() {
        return {
            ...this.state,
            serverTime: Date.now()
        };
    }

    loadUrl(url) {
        this.state.url = url;
        this.state.playing = true;
        this.state.currentTime = 0;
        this.state.updatedAt = Date.now();
    }

    sync(data) {
        if (data.currentTime !== undefined) this.state.currentTime = data.currentTime;
        if (data.playing !== undefined) this.state.playing = data.playing;
        this.state.updatedAt = Date.now();
    }

    play(currentTime) {
        this.state.playing = true;
        if (currentTime !== undefined) this.state.currentTime = currentTime;
        this.state.updatedAt = Date.now();
    }

    pause(currentTime) {
        this.state.playing = false;
        if (currentTime !== undefined) this.state.currentTime = currentTime;
        this.state.updatedAt = Date.now();
    }

    seek(currentTime) {
        this.state.currentTime = currentTime;
        this.state.updatedAt = Date.now();
    }

    enqueue(url, addedBy) {
        this.state.queue.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            url,
            addedBy
        });
        this.state.updatedAt = Date.now();
    }

    dequeue() {
        if (this.state.queue.length > 0) {
            const nextItem = this.state.queue.shift();
            this.loadUrl(nextItem.url);
            return nextItem;
        }
        return null;
    }

    removeQueueItem(itemId) {
        this.state.queue = this.state.queue.filter(item => item.id !== itemId);
        this.state.updatedAt = Date.now();
    }
}
