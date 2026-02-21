Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Zira Desktop")
$synth.Speak("Done! Database seeded with six thousand twenty real KKU courses from twenty four faculties.")
