# 🔊 Audio Sensitivity Increased 2x

## What I Changed

I've increased the microphone sensitivity by **2x** so you don't need to shout as loudly.

### Changes Made:

1. **RMS (Root Mean Square) Calculation**:
   - Applied **2x multiplier** to audio level detection
   - Now: `rms * 2.0` (capped at 1.0)
   - Previous: `rms` (original level)

2. **Spike Detection Threshold**:
   - Lowered from `0.7` to `0.35` (halved)
   - More sensitive to audio spikes and sudden changes

3. **Audio Detection**:
   - Microphone will now pick up **quieter sounds** more easily
   - Less need to speak loudly
   - Better detection of subtle audio changes

## How It Works

The audio sensor now:
- ✅ **Amplifies** incoming audio levels by 2x
- ✅ **Detects spikes** at lower thresholds
- ✅ **Calculates stress** using the amplified values
- ✅ **More responsive** to normal speaking volume

## Apply Changes

**Refresh your browser** to load the updated code:
- Press `Ctrl + Shift + R` (hard refresh)
- Or restart the frontend server

## Testing

1. **Go to Student Dashboard**
2. **Speak at normal volume** (no need to shout)
3. **Check the audio stress bar** - should be more reactive
4. **Risk score** should respond better to normal speech

## Fine-Tuning (Optional)

If you want to adjust sensitivity further:

**File**: `frontend/src/sensors/audio.ts`

- **Line ~53**: Change `rms * 2.0` to `rms * 3.0` (even more sensitive)
- **Line ~19**: Change `0.35` to lower value (e.g., `0.25`) for more spike detection

---

**Microphone is now 2x more sensitive! Refresh browser and test!** 🔊
