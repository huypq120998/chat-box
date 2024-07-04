import { Component } from "react";
import eventBus from "../../plugins/EventBus";
import icVoice from "./../../assets/audio.png"
import styles from "./Voice.module.css"
const URI = 'wss://viettelgroup.ai/voice/api/asr/trolyaoluat/v1/ws/decode_online'
const RATE = 48000
const CONFIG = ',+format=(string)S16LE,+channels=(int)1&token='
const TOKEN = 'hPu-fGap6sdW7mo9EqPoV8kGCe-e9DgIaOLrCVDzmqBHW8LxhPMpyssUDW4fxSDM'
const MODEL = 'TROLYAO_PL'
const SILENT_THRESHOLD = 1000


interface Props {
  makeChatVoice: (q: string) => void
  changeRecord: (v: boolean) => void
  onSendText: (t: string) => void
  startVoice: () => void
  stopRecording: () => void
  disabled: boolean
}

export default class ChatVoice extends Component<Props, any> {
  btnType: string | undefined;
  audioContext: any;
  recorder: any;
  stream: MediaStream | undefined;
  ws: any;
  showModal: any;
  buffer: any;
  countSilentDuration: number | any = 0;
  isStop: any;
  message: any;
  html: string | "" | undefined;
  constructor(props: Props) {
    super(props);
    this.state = {
      btnType: "normal",
      showModal: false,
      isStop: true,
      html: "",
      message: "",
      //   roundLoading,
      connected: false,
    };
  }



  toggleRecord = () => {
    if (this.state.isStop) {
      this.record();
    } else {
      this.stop();
    }
  }

  record = () => {

    this.btnType = "recording";

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext)()

      if (this.audioContext?.state === "suspended") {
        this.audioContext.resume();
      }

      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then((stream) => {
          this.props.changeRecord(false)
          const audioInput = this.audioContext.createMediaStreamSource(stream);
          const bufferSize = 0;
          this.recorder = this.audioContext.createScriptProcessor(
            bufferSize,
            1,
            1
          );

          this.recorder.onaudioprocess = (e: any) => {
            if (
              !this.isStop &&
              this.ws &&
              this.ws.readyState === this.ws.OPEN
            ) {
              this.buffer = e.inputBuffer.getChannelData(0);
              const int16ArrayData = this.convertFloat32ToInt16(this.buffer);
              this.countSilentDuration +=
                int16ArrayData.length / this.audioContext.sampleRate;

              for (let i = 0; i < int16ArrayData.length; i++) {
                if (Math.abs(int16ArrayData[i]) > SILENT_THRESHOLD) {
                  this.countSilentDuration = 0;
                  break;
                }
              }

              this.ws.send(int16ArrayData.buffer);
            }
          };

          audioInput.connect(this.recorder);
          this.recorder.connect(this.audioContext.destination);
          this.stream = stream;
        })
        .catch((e) => {
          console.log(e);
          this.props.stopRecording()
          alert("Chưa kết nối được microphone");
        });
    }

    this.setState({
      isStop: false
    });
  }

  connectWS = () => {
    this.setState({
      connected: false
    });

    this.ws = new WebSocket(
      URI +
      "?content-type=audio/x-raw,+layout=(string)interleaved,+rate=(int)" +
      RATE +
      CONFIG +
      TOKEN +
      "&model=" +
      MODEL
    )

    this.ws.onopen = () => {
      this.setState({
        connected: true
      });
    };


    this.ws.onclose = () => {
      this.setState({
        connected: false
      });
      this.stop();
    };

    this.ws.onmessage = (e: any) => {

      this.message = e.data;
      const resp = JSON.parse(e.data);

      if (
        resp.status === 0 &&
        resp.result &&
        resp.result.hypotheses.length > 0
      ) {
        const text = decodeURI(resp.result.hypotheses[0].transcript_normed);

        if (text === "<unk>.") {
          return;
        }

        if (resp.result.final) {
          this.stop();
          this.html = text;
          setTimeout(() => {
            this.showModal = false;
            this.props.onSendText(text)
            this.props.changeRecord(true)
          }, 500);
          return;
        }

        this.html = text;
        this.props.makeChatVoice(text)
      }
    };
  }

  closeWS = () => {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send("EOS");
      this.ws.close();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(function (track: any) {
        if (track.readyState === "live") {
          track.enabled = false;
          track.stop();
        }
      });
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.audioContext = null
  }

  stop = () => {
    this.closeWS();
    this.audioContext = null

    this.setState({
      btnType: "normal"
    });
    this.setState({
      isStop: true
    });
    this.setState({
      html: ""
    });
  }

  convertFloat32ToInt16 = (float32ArrayData: any) => {
    let l = float32ArrayData.length;
    const int16ArrayData = new Int16Array(l);

    while (l--) {
      int16ArrayData[l] = Math.min(1, float32ArrayData[l]) * 0x7fff;
    }

    return int16ArrayData;
  }
  startRecording = () => {
    if (this.props.disabled) {
      return;
    }
    this.props.startVoice()
    // this.props.changeRecord(false)
    this.html = "";
    this.connectWS();
    this.toggleRecord();
  }
  handleCancel = () => {
    this.stop()
  }

  componentDidMount() {
    eventBus.on('stopRecordingParent', (data: any) => {
      this.stop()
    });
    eventBus.on('startRecordingParent', (data: any) => {
      this.startRecording()
    });
  }
  render = () => {
    return (
      <div className="">
        <button
          disabled={this.props.disabled}
          className={styles.microButton}
          style={{ backgroundColor: this.props.disabled ? '#f2f2f2' : '' }}
          onClick={this.startRecording}
        >
          <img style={{ width: "20px", height: "auto" }} src={icVoice} />
        </button>
      </div>
    );
  }
}
