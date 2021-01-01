document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("upload").addEventListener("change", function () {
        fr = new FileReader();
        fr.readAsDataURL(document.getElementById("upload").files[0]);
        fr.onload = (e) => {
            var audio = document.createElement('audio');
            audio.src = e.target.result;
            initWavesurfer(audio);
        };
        // remove upload button
        document.getElementById("upload").outerHTML = "";
    });

    function initWavesurfer(audio) {
        const wavesurfer = WaveSurfer.create({
            container: document.querySelector('#waveform'),
            backend: 'MediaElement',
            mediaControls: false
        });

        wavesurfer.on('error', function (e) {
            console.warn(e);
        });

        wavesurfer.load(audio);

        document.getElementById("controls").style.display = 'block';

        document
            .querySelector('[data-action="play"]')
            .addEventListener('click', wavesurfer.playPause.bind(wavesurfer));

        document
            .querySelector('[data-action="record"]')
            .addEventListener('click', () => {
                const audioCtx = wavesurfer.backend.getAudioContext();
                const dest = audioCtx.createMediaStreamDestination();
                const audioStream = dest.stream;

                audioCtx.createMediaElementSource(audio).connect(dest);

                const chunks = [];
                const rec = new MediaRecorder(audioStream);
                rec.ondataavailable = (e) => {
                    chunks.push(e.data);
                }
                rec.onstop = () => {
                    const blob = new Blob(chunks, { type: "audio/ogg" });
                    const a = document.createElement("a");
                    a.download = "export.ogg";
                    a.href = URL.createObjectURL(blob);
                    a.textContent = "export the audio";
                    a.click();
                    window.URL.revokeObjectURL(a.href);
                }

                wavesurfer.play();
                rec.start();

                setTimeout(() => {
                    rec.stop();
                    wavesurfer.stop();
                }, 5 * 1000);
            });
    }
});