import React, { Component } from 'react'

class Video extends Component {
    constructor(props) {
        super(props)
        this.state = {
            audio: true,
            video: true
        }
    }

    componentDidMount() {
        if (this.props.videoStream) {
            this.video.srcObject = this.props.videoStream
        }
    }

    componentWillReceiveProps(nextProps) {
        // eslint-disable-next-line
        if (nextProps.videoStream && nextProps.videoStream !== this.props.videoStream) {
            this.video.srcObject = nextProps.videoStream
        }
    }

    mute = (event) => {
        const stream = this.video.srcObject.getTracks().filter(track => track.kind === 'audio')
        this.setState(state => {
            if (stream) {
                stream[0].enabled = !state.audio
                return {
                    audio: !state.audio
                }
            }
        })
    }

    off = (event) => {
        const stream = this.video.srcObject.getTracks().filter(track => track.kind === 'video')
        this.setState(state => {
            if (stream) {
                stream[0].enabled = !state.video
                return {
                    video: !state.video
                }
            }
        })
    }

    render() {
        // eslint-disable-next-line
        const controls = this.props.showMuteControls && (
            <div style={{
                display: 'flex',
                alignItems: 'center'
            }}>
                <i onClick={this.mute} style={{
                    cursor: 'pointer',
                    padding: 6,
                    fontSize: 20,
                    // eslint-disable-next-line
                    color: this.state.audio && 'white' || 'red'
                    // eslint-disable-next-line
                }} class='material-icons'> {this.state.audio && 'mic' || 'mic_off'}</i>

                <i onClick={this.off} style={{
                    cursor: 'pointer',
                    padding: 6,
                    fontSize: 20,
                    // eslint-disable-next-line
                    color: this.state.video && 'white' || 'red'
                    // eslint-disable-next-line
                }} class='material-icons'> {this.state.video && 'videocam' || 'videocam_off'}</i>
            </div>
        )
        return (
            <div style={{ ...this.props.frameStyle }}>
                <video
                    id={this.props.id}
                    muted={this.props.muted}
                    autoPlay
                    style={{ ...this.props.videoStyle }}
                    ref={(ref) => { this.video = ref }}>
                </video>
                {controls}
            </div>
        )
    }
}
export default Video