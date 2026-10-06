const bpm = 92
const eighth = 60 / bpm / 2

const pitch: Record<string, number> = {
  G2: 98,
  A2: 110,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
  C6: 1046.5,
}

const melody = [
  "E5", null, "G5", null, "C6", null, "G5", "E5",
  "D5", null, "E5", "G5", null, "E5", null, "C5",
  "E5", null, "A5", null, "C6", null, "A5", "E5",
  "D5", null, "C5", "E5", null, "A4", null, "C5",
  "F5", null, "A5", null, "C6", null, "A5", "F5",
  "G5", null, "F5", "E5", null, "D5", null, "C5",
  "D5", null, "G5", null, "B5", null, "G5", "D5",
  "E5", null, "D5", "C5", null, "D5", "B4", "D5",
]

const bass = melody.map((_, index) => {
  const roots = ["C3", "G2", "A2", "E3", "F3", "C3", "G2", "D3"]
  return index % 8 === 0 ? roots[Math.floor(index / 8)] : null
})

const chords: Array<string[] | null> = melody.map(() => null)
chords[0] = ["C4", "E4", "G4"]
chords[16] = ["A3", "C4", "E4"]
chords[32] = ["F3", "A3", "C4"]
chords[48] = ["G3", "B3", "D4"]

let context: AudioContext | null = null
let output: GainNode | null = null
let bus: GainNode | null = null
let echo: DelayNode | null = null
let nextTime = 0
let step = 0
let timer = 0
let wanted = false
const listeners = new Set<(playing: boolean) => void>()

function emit() {
  listeners.forEach((listener) => listener(wanted))
}

export function subscribeMusic(listener: (playing: boolean) => void) {
  listeners.add(listener)
  listener(wanted)
  return () => {
    listeners.delete(listener)
  }
}

export function toggleMusic() {
  wanted = !wanted
  if (wanted) {
    if (!context) start()
    else resume()
  } else {
    window.clearTimeout(timer)
    if (context && output) {
      output.gain.cancelScheduledValues(context.currentTime)
      output.gain.setValueAtTime(0, context.currentTime)
      void context.suspend()
    }
  }
  emit()
}

function resume() {
  if (!context || !output) return
  nextTime = context.currentTime + 0.05
  output.gain.setValueAtTime(0.85, context.currentTime)
  void context.resume()
  queue()
}

function start() {
  const audio = new AudioContext()
  context = audio
  const filter = audio.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 3400
  const gain = audio.createGain()
  gain.gain.value = 0.85
  const dry = audio.createGain()
  dry.gain.value = 1
  const delay = audio.createDelay()
  delay.delayTime.value = eighth * 1.5
  const feedback = audio.createGain()
  feedback.gain.value = 0.26
  const wet = audio.createGain()
  wet.gain.value = 0.2
  dry.connect(filter)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)
  wet.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  output = gain
  bus = dry
  echo = delay
  nextTime = audio.currentTime + 0.06
  void audio.resume()
  queue()
  emit()
}

function queue() {
  if (!context || !wanted) return
  const horizon = context.currentTime + 0.28
  while (nextTime < horizon) {
    const note = melody[step]
    const root = bass[step]
    const chord = chords[step]
    if (note) bell(nextTime, note)
    if (root) voice(nextTime, root, 0.5, 0.07, "sine", false)
    if (chord) chord.forEach((name) => voice(nextTime, name, 4.4, 0.026, "sine", false))
    nextTime += eighth
    step = (step + 1) % melody.length
  }
  timer = window.setTimeout(queue, 90)
}

function bell(time: number, name: string) {
  if (!context || !bus || !echo) return
  const fundamental = context.createOscillator()
  const overtone = context.createOscillator()
  const gain = context.createGain()
  const overtoneGain = context.createGain()
  fundamental.type = "sine"
  overtone.type = "triangle"
  fundamental.frequency.value = pitch[name]
  overtone.frequency.value = pitch[name] * 2
  overtoneGain.gain.value = 0.16
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(0.1, time + 0.018)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.62)
  fundamental.connect(gain)
  overtone.connect(overtoneGain)
  overtoneGain.connect(gain)
  gain.connect(bus)
  gain.connect(echo)
  fundamental.start(time)
  overtone.start(time)
  fundamental.stop(time + 0.66)
  overtone.stop(time + 0.66)
}

function voice(time: number, name: string, length: number, peak: number, type: OscillatorType, echoed: boolean) {
  if (!context || !bus || !echo) return
  const osc = context.createOscillator()
  const twin = context.createOscillator()
  const gain = context.createGain()
  osc.type = type
  twin.type = type
  osc.frequency.value = pitch[name]
  twin.frequency.value = pitch[name] * 1.004
  const twinGain = context.createGain()
  twinGain.gain.value = 0.45
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), time + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length)
  osc.connect(gain)
  twin.connect(twinGain)
  twinGain.connect(gain)
  gain.connect(bus)
  if (echoed) gain.connect(echo)
  osc.start(time)
  twin.start(time)
  osc.stop(time + length + 0.05)
  twin.stop(time + length + 0.05)
}
