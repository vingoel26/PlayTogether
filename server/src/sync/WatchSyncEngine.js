export class WatchSyncEngine {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.state = {
            url: null,
            playing: false,
            currentTime: 0,
            updatedAt: Date.now()
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
}
