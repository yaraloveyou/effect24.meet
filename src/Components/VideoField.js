import React, { Component, useState } from 'react'
import Video from './Video'

class VideoField extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allVideo: [],
            remoteStreams: []
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.remoteStreams !== nextProps.remoteStreams) {
            const _allVideo = nextProps.remoteStreams.map((allVideo, index) => {
                const _videoTrack = allVideo.stream.getTracks().filter(track => track.kind === 'video')
                let video = _videoTrack && (
                    <Video
                        videoStream={allVideo.stream}
                        frameStyle={{ width: 120, float: 'left', padding: '0 3px' }}
                        videoStyle={{
                            cursos: 'pointer',
                            borderRadius: 3,
                            objectFit: 'cover',
                            width: '100%'
                        }}
                    />) || <div></div>

                return (
                    <div
                        id={allVideo.name}
                        onClick={() => this.props.switchVideo(allVideo)}
                        style={{ display: 'inline-block' }}
                        key={index}
                    >
                        {video}
                    </div>
                )
            })

            this.setState({
                remoteStreams: nextProps.remoteStreams,
                allVideo: _allVideo
            })
        }
    }

    render() {
        return (
            <div
                style={{
                    zIndex: 3,
                    position: 'fixed',
                    padding: '6px 3px',
                    backgroundColor: '#202020',
                    maxHeight: 110,
                    maxWidth: '80%',
                    bottom: 'auto',
                    right: 10,
                    left: 0,
                    top: 10,
                    overflowX: 'scroll',
                    whiteSpace: 'nowrap'
                }}
            >
                { this.state.allVideo}
            </div>
        )
    }
}

export default VideoField