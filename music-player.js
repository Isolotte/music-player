// 필요한 DOM 요소들을 가져옵니다.
const audioPlayer = document.getElementById('audio-player');
const albumArtwork = document.getElementById('album-artwork');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBarContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');

// JSBin의 Output 창 URL에서 쿼리 파라미터를 가져옵니다.
const urlParams = new URLSearchParams(window.location.search);
const songUrl = urlParams.get('song'); // 'song' 파라미터 값 (음악 파일 경로)
const imageUrl = urlParams.get('image'); // 'image' 파라미터 값 (이미지 파일 경로)
const title = urlParams.get('title'); // 'title' 파라미터 값 (노래 제목)
const artist = urlParams.get('artist'); // 'artist' 파라미터 값 (아티스트 이름)

// URL 파라미터에서 가져온 정보로 플레이어 내용을 업데이트합니다.
let isPlayerReady = false; // 오디오 로드가 완료되었는지 확인하는 플래그

if (songUrl) {
    // URL 파라미터로 받은 오디오 URL을 설정
    audioPlayer.src = decodeURIComponent(songUrl); // 혹시 URL 자체가 인코딩되어 있다면 디코딩
    playPauseBtn.disabled = false; // 기본적으로 버튼 활성화
} else {
    console.error("URL에 'song' 파라미터가 없습니다. 오디오를 로드할 수 없습니다.");
    trackTitle.textContent = "오디오 없음";
    trackArtist.textContent = "URL 확인 필요";
    playPauseBtn.textContent = 'X';
    playPauseBtn.disabled = true; // 노래 URL이 없으면 버튼 비활성화
    albumArtwork.src = "https://via.placeholder.com/300x300?text=No+Audio"; // 플레이스홀더 오류 이미지
}

if (imageUrl) {
     // URL 파라미터로 받은 이미지 URL을 설정
    albumArtwork.src = decodeURIComponent(imageUrl); // 혹시 URL 자체가 인코딩되어 있다면 디코딩
} else {
    // 이미지 URL이 없으면 기본 이미지 또는 숨김
    // 기본 이미지는 JSBin에서는 직접 호스팅할 수 없으므로 공개된 URL 사용
    albumArtwork.src = "https://via.placeholder.com/300x300?text=No+Image"; // 기본 플레이스홀더 이미지
}

// 제목과 아티스트 업데이트 (URL 디코딩)
if (title) {
    trackTitle.textContent = decodeURIComponent(title);
} else {
     trackTitle.textContent = "알 수 없는 노래";
}

if (artist) {
    trackArtist.textContent = decodeURIComponent(artist);
} else {
    trackArtist.textContent = "알 수 없는 아티스트";
}


// 시간 포맷팅 함수 (초 -> MM:SS 형식)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
}

// 오디오 메타데이터 로드 완료 이벤트 리스너 (총 시간 가져오기)
audioPlayer.addEventListener('loadedmetadata', () => {
    console.log("Metadata loaded. Duration:", audioPlayer.duration);
    durationSpan.textContent = formatTime(audioPlayer.duration);
    isPlayerReady = true; // 플레이어 준비 완료
    if (!audioPlayer.paused) { // 만약 로드 후 자동 재생 상태라면
         playPauseBtn.textContent = '❚❚';
    } else {
         playPauseBtn.textContent = '▶';
    }
     playPauseBtn.disabled = false; // 로드 완료되면 버튼 활성화
});

 // 오디오가 재생될 수 있는 상태가 되었을 때
audioPlayer.addEventListener('canplay', () => {
     console.log("Can play event fired.");
     // 버튼 상태 등을 여기서 업데이트할 수도 있지만, loadedmetadata 또는 playing에서 주로 처리
});

// 오디오 로딩 오류 발생 시
audioPlayer.addEventListener('error', (e) => {
    console.error("오디오 로드 또는 재생 오류:", e);
    trackTitle.textContent = "오디오 로드 오류";
    trackArtist.textContent = "파일 경로 확인";
    playPauseBtn.textContent = 'X';
    playPauseBtn.disabled = true; // 오류 시 버튼 비활성화
    progressBar.style.width = '0%';
    currentTimeSpan.textContent = '0:00';
    durationSpan.textContent = '0:00';
});


// 재생/일시정지 버튼 클릭 이벤트 리스너
playPauseBtn.addEventListener('click', () => {
    if (!isPlayerReady) {
         console.warn("플레이어가 아직 준비되지 않았습니다.");
         return; // 준비 안됐으면 아무것도 안함
    }

    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                 console.log("Playback started successfully.");
                 playPauseBtn.textContent = '❚❚'; // 일시정지 아이콘
            })
            .catch(error => {
                console.error("Playback failed:", error);
                // 자동 재생 방지 정책 등으로 인해 재생이 실패할 수 있음
                 playPauseBtn.textContent = '▶'; // 실패 시 재생 버튼 유지
                 alert("음악 재생을 시작할 수 없습니다. 사용자의 상호작용이 필요할 수 있습니다.");
            });

    } else {
        audioPlayer.pause();
        console.log("Playback paused.");
        playPauseBtn.textContent = '▶'; // 재생 아이콘
    }
});

// 오디오 재생 시간 업데이트 이벤트 리스너
audioPlayer.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audioPlayer;

    // 진행 바 업데이트
    if (duration > 0 && isFinite(duration)) { // duration이 유효하고 무한대가 아닐 때만 계산
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    // 시간 표시 업데이트
    currentTimeSpan.textContent = formatTime(currentTime);
});


// 오디오 재생 종료 이벤트 리스너
audioPlayer.addEventListener('ended', () => {
    console.log("Playback ended.");
    playPauseBtn.textContent = '▶'; // 재생 아이콘으로 되돌리기
    progressBar.style.width = '0%'; // 진행 바 초기화
    currentTimeSpan.textContent = '0:00'; // 현재 시간 초기화
     audioPlayer.currentTime = 0; // 처음으로 되돌리기
});

// 진행 바 클릭 시 탐색 (Seek) 기능
progressBarContainer.addEventListener('click', (e) => {
     if (!isPlayerReady) {
         console.warn("플레이어가 아직 준비되지 않았습니다.");
         return;
    }
    const width = progressBarContainer.offsetWidth; // 진행 바 컨테이너 전체 너비
    // JSBin의 Output 창에서는 offsetX가 올바르게 동작하지 않을 수 있습니다.
    //clientX를 사용하여 전체 문서 기준 좌표를 얻고, 컨테이너의 위치를 빼주는 방식을 사용합니다.
    const clickX = e.clientX - progressBarContainer.getBoundingClientRect().left;

    const duration = audioPlayer.duration;

    if (duration > 0 && isFinite(duration)) { // duration이 유효하고 무한대가 아닐 때만 탐색
        const seekTime = (clickX / width) * duration;
         console.log(`Seeking to ${seekTime} seconds.`);
        audioPlayer.currentTime = seekTime;
    }
});

 // (선택 사항) 로딩 중/재생 중 상태 표시 (버튼 아이콘 변경 등)
 audioPlayer.addEventListener('waiting', () => {
     console.log("Buffering...");
     // playPauseBtn.textContent = '...'; // 로딩 중 표시 (선택 사항)
 });

 audioPlayer.addEventListener('playing', () => {
     console.log("Playing.");
     playPauseBtn.textContent = '❚❚'; // 재생 시작 시 일시정지 아이콘
 });