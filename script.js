/* ============================================================
   THE MUSEUM OF ME — script.js
   콘텐츠 데이터 + 렌더링 + 라우팅 + 사운드 + 접근성

   ■ 글을 고치려면 아래 1) ROOMS, 2) EXHIBITS, 3) CLOSING 만
     수정하면 됩니다. 그 아래 UI 코드는 건드릴 필요가 없습니다.

   ■ 전시품을 더하거나 뺄 때
     EXHIBITS 에서 { } 덩어리 하나를 통째로 추가하거나 지우면 끝입니다.
       · 번호(001, 002 …)는 적는 자리가 없습니다. 적힌 순서대로 자동입니다.
       · 전시실 안의 순서를 바꾸고 싶으면 덩어리의 위치를 옮기면 됩니다.
       · 전시품 수를 적어 둔 문장도 손댈 필요가 없습니다. 아래 설명 참고.

   ■ 문장 안에 전시품 수를 넣고 싶을 때
     {전시품수} 라고 적으면 우리말 숫자로 바뀝니다.
       전시실 intro  → 그 전시실의 전시품 수   예) "{전시품수} 점의 전시품은"
       CLOSING body → 전체 전시품 수
     아라비아 숫자로 넣고 싶으면 {숫자} 를 씁니다.

   ■ 사진
     image 에 파일명만 적고 assets/images/ 안에 같은 이름으로 넣으면 됩니다.
     파일이 없으면 glyph 선화가 대신 자리를 지키므로 비워 두어도 괜찮습니다.
     glyph 이름은 아래 GLYPHS 에 있는 것 중에서 고릅니다.
   ============================================================ */

/* ── 0. 설정 ────────────────────────────────────────────── */
const CONFIG = {
  // 배경음악 ① 음원 파일로 틀기 (현재 이 방식)
  //   곡을 바꾸려면 assets/audio/ 에 파일을 넣고 이 줄의 파일명만 고치세요.
  //   mp3 · m4a · ogg · wav 모두 됩니다. 끝나면 자동으로 처음부터 반복합니다.
  //   파일이 없으면 소리 버튼이 저절로 비활성화되고 화면은 멀쩡합니다.
  audioSrc: "assets/audio/gallery-ambience.mp3",

  // 배경음악 ② 유튜브로 틀기 — 쓰려면 v= 뒤 11자리를 여기에 적습니다.
  //   https://www.youtube.com/watch?v=oyFTBhUNwKQ  →  "oyFTBhUNwKQ"
  //   적어 두면 위 음원 파일 대신 유튜브가 쓰입니다.
  youtubeId: "",

  defaultVolume: 0.18,
  imageBase: "assets/images/",
};

/* ── 1. 전시실 ────────────────────────────────────────────
   tone   : 전시실 조명 — dark(어두운 전시실) / light / warm / air
            어두운 전시실과 밝은 전시실이 번갈아 나오도록 배치합니다.
   layout : 전시 구성 — archive / objects / documents / collection / sparse
            전시실마다 전시품을 거는 방식이 달라집니다.            */
const ROOMS = [
  {
    id: "origins",
    number: "01",
    title: "나의 시작",
    titleEn: "ORIGINS",
    question: "나는 어디에서 시작했는가",
    tone: "dark",
    layout: "archive",
    intro:
      "모든 전시는 가장 오래된 기록에서 시작합니다. 이 방에는 지금의 내가 만들어지기 시작한 시기의 흔적을 놓았습니다.",
  },
  {
    id: "thinking",
    number: "02",
    title: "생각하는 방식",
    titleEn: "THE WAY I THINK",
    question: "나는 세상을 어떻게 보는가",
    tone: "light",
    layout: "objects",
    intro:
      "무엇을 비교하고, 어떤 기준으로 판단하고, 어디에서 질문을 시작하는지. 이 방의 전시품은 모두 보는 방식에 관한 것입니다.",
  },
  {
    id: "changed",
    number: "03",
    title: "내가 바꾼 것들",
    titleEn: "THINGS I CHANGED",
    question: "나는 무엇을 바꾸었는가",
    tone: "dark",
    layout: "documents",
    intro:
      "문제를 찾고, 판단하고, 결과를 확인하고, 남은 것을 적는 순서로 일해 왔습니다. {전시품수} 점의 전시품은 각각 하나의 문제가 어떻게 풀렸는지를 보여 줍니다.",
  },
  {
    id: "going",
    number: "04",
    title: "나를 움직이는 것",
    titleEn: "WHAT KEEPS ME GOING",
    question: "무엇이 나를 계속하게 하는가",
    tone: "warm",
    layout: "collection",
    intro:
      "성과로 환산되지 않아도 계속하고 있는 것들입니다. 혼자 쌓아 온 기록과 함께 배우는 사람들이, 숫자로 남지 않는 자리에서 저를 계속 움직이게 합니다.",
  },
  {
    id: "becoming",
    number: "05",
    title: "아직 되어가는 중",
    titleEn: "STILL BECOMING",
    question: "나는 어떤 사람이 되어가는가",
    tone: "air",
    layout: "sparse",
    intro:
      "마지막 방에는 전시품이 하나뿐입니다. 아직 일어나지 않은 일을 위해 비워 둔 자리이고, 이 전시에서 가장 중요한 칸이기도 합니다.",
  },
];

/* ── 2. 전시품 ──────────────────────────────────────────── */
/* image: assets/images/ 안의 파일명. 파일이 없으면 선화(line art)가
   자동으로 대신 표시되므로 레이아웃이 깨지지 않습니다.            */
const EXHIBITS = [
  /* ── 전시실 01 · 나의 시작 ───────────────────────────── */
  {
    id: "childhood",
    roomId: "origins",
    title: "첫 번째 사진",
    titleEn: "A Photograph from the Beginning",
    tagline: "가장 오래된 기록 한 장.",
    glyph: "photo",
    crop: "portrait",
    image: "childhood.jpg",
    imageAlt: "전시 벽에 걸린 어린 시절 사진",
    caption: "개인 소장 사진",
    object:
      "어린 시절, 커다란 티셔츠를 입고 브이를 하고 있는 제 사진입니다. 특별한 순간은 아니지만, 지금의 저를 소개하는 첫 번째 전시품으로 골랐습니다.",
    story: [
      "지금보다 한참 어렸던 시절입니다. 지금의 모습과는 많이 다르지만, 이 사진을 시작으로 제가 살아온 이야기를 하나씩 꺼내 보려 합니다.",
    ],
    reflection: "지금의 나를 소개하기 위한 첫 번째 기록",
    reveals: ["시작점", "기억"],
  },
  {
    id: "university",
    roomId: "origins",
    title: "학생이던 시간",
    titleEn: "The Student I Was",
    tagline: "배우는 방식이 처음 만들어진 시기.",
    glyph: "cap",
    crop: "landscape",
    image: "university.jpg",
    imageAlt: "대학 시절을 기록한 사진",
    caption: "학창 시절의 기록",
    object:
      "학생 시절, 친구들과 페러글라이딩에 도전했던 날의 기록입니다. 학점과 스펙으로는 남지 않는, 꽤 짜릿했던 순간입니다.",
    story: [
      "교실에서는 출석을 부르고, 이곳에서는 안전장비를 챙겼습니다. 사진 속 표정은 제법 여유롭지만, 어쨌든 이날만큼은 책상보다 하늘이 가까웠습니다. 지금 생각해도 학생 때라서 할 수 있었던 무모하고도 즐거운 경험입니다.",
    ],
    reflection: "젊음은 이력서에 적히지 않는 경험으로도 완성됩니다.",
  },
  {
    id: "early-career",
    roomId: "origins",
    title: "첫 출근",
    titleEn: "First Steps into the Working World",
    tagline: "혼자 맞히는 일에서 함께 움직이는 일로.",
    glyph: "door",
    crop: "tall",
    image: "early-career.jpg",
    imageAlt: "사회생활의 시작을 상징하는 사진",
    caption: "사회생활 초기의 기록",
    object:
      "사회인이라는 새로운 역할을 처음 맡았던 날의 기록입니다. 정장과 긴장감, 그리고 어색하지만 자신감 넘치는 엄지 하나.",
    story: [
      "첫 출근은 모르는 것 투성이였습니다. 누가 누구인지, 뭘 해야 하는지, 언제 질문해야 하는지까지 전부 새로웠습니다. 그래도 사진 속 표정만큼은 이미 회사생활 만렙입니다. 현실은 이제 막 튜토리얼을 시작했을 뿐이지만요.",
    ],
    reflection:
      "프로 직장인처럼 보이는 것과 진짜 프로가 되는 것 사이에는 꽤 긴 전시 공간이 있습니다.",
  },

  /* ── 전시실 02 · 생각하는 방식 ───────────────────────── */
  {
    id: "calculator",
    roomId: "thinking",
    title: "계산기",
    titleEn: "The Calculator",
    tagline: "느낌과 사실을 갈라 주는 도구.",
    glyph: "calculator",
    crop: "square",
    image: "calculator.jpg",
    imageAlt: "전시대 위에 놓인 계산기",
    caption: "계산기",
    object:
      "이 전시에서 가장 단순하면서도 제가 가장 애용하는 도구 입니다. 막연한 느낌을 숫자로 바꾸어 주기 때문에 무언가를 결정하기 전에는 한 번 더 계산해 보는 편입니다.",
    story: [
      "재무·회계 업무를 하며 생긴 습관은 결론을 내리기 전 숫자를 한 번 더 쪼개 보는 것입니다. 단가와 수량, 기간과 조건을 나누어 보면 ‘비싸다’거나 ‘유리하다’는 판단이 달라질 때가 있습니다.",
      "그래서 회의에서 ‘느낌상’이라는 말이 나오면, 가능한 한 그 느낌을 숫자로 바꿔 놓고 다시 이야기하려고 합니다.",
    ],
    reflection:
      "분석은 복잡한 모델보다 비교할 수 있는 단위로 쪼개는 데서 시작됩니다. 무엇이 더 나은지는 그다음에 판단할 수 있습니다.",
    reveals: ["분석적 사고", "재무·회계", "근거 기반 판단"],
  },
  {
    id: "question",
    roomId: "thinking",
    title: "질문이 적힌 메모",
    titleEn: "The Question",
    tagline: "가장 자주 쓴 한 문장.",
    glyph: "question",
    crop: "square",
    image: "question-note.jpg",
    imageAlt: "질문 한 줄이 적힌 작은 메모",
    caption: "업무 메모",
    object:
      "작은 메모지에 적힌 한 문장입니다. “이건 왜 이렇게 하고 있나요?” 오래되어 당연해진 방식일수록 이 질문 하나에 가장 큰 개선의 기회가 숨어 있습니다.",
    story: [
      "새 업무를 맡으면 기존 방식을 따라 해보며 설명되지 않는 단계에 표시를 해둡니다. 이유를 물었을 때 ‘예전부터 그래왔다’가 유일한 답변이라면, 그곳이 바로 가장 먼저 바뀌어야 할 지점입니다.",
    ],
    reflection:
      "질문은 비판이 아니라 확인입니다. 이유가 분명하면 유지하고, 없으면 바꿉니다. 어느 쪽이든 묻고 난 다음이 언제나 더 낫습니다.",
    reveals: ["문제 발견", "관행 점검", "호기심"],
  },

  /* ── 전시실 03 · 내가 바꾼 것들 ──────────────────────── */
  {
    id: "automation-tool",
    roomId: "changed",
    title: "직접 개발한 업무 자동화 프로그램",
    titleEn: "The Working Tool",
    tagline: "반복되는 작업을 구조로 바꾼 결과.",
    glyph: "tool",
    crop: "landscape",
    image: "automation-tool.png",
    imageAlt: "직접 제작한 업무 자동화 프로그램의 실행 화면",
    caption: "시민개발자",
    object:
      "현장의 작은 불편함을 지나치지 않고 직접 파이썬 프로그램을 만들어 해결한 결과, 그 노력을 인정받아 사보 인터뷰에 소개된 기록입니다.",
    story: [
      "같은 입력과 같은 확인을 매번 손으로 반복하는 업무가 있었습니다. 시간이 오래 걸리는 것보다, 할 때마다 실수가 끼어들 수 있다는 점이 더 문제였습니다.",
      "업무를 단계로 나눈 뒤 사람의 판단이 필요한 부분과 기계가 반복해도 되는 부분을 갈랐습니다. 반복 구간만 프로그램이 처리하게 하고, 확인은 사람이 하도록 남겨 두었습니다.",
    ],
    reflection:
      "기다리기만 하기 보다, 현장을 가장 잘 아는 사람이 직접 도구를 만들어 문제를 해결합니다.",
    reveals: ["시민개발자", "문제 정의", "도구 제작"],
    figures: [
      { label: "이전", value: "약 50분" },
      { label: "이후", value: "약 2분" },
    ],
  },
  {
    id: "campaign",
    roomId: "changed",
    title: "500만 번의 발걸음",
    titleEn: "The Campaign",
    tagline: "500만 명이 본 건강 캠페인.",
    glyph: "campaign",
    crop: "wide",
    image: "campaign.jpg",
    imageAlt: "심뇌혈관질환 예방 캠페인 영상의 한 장면",
    caption: "캠페인 기록",
    object:
      "심뇌혈관질환 예방을 위해 직접 기획하고 주최한 대국민 홍보 캠페인입니다. 유튜브 조회수 500만 회를 기록했습니다.",
    story: [
      "자칫 무겁고 딱딱해지기 쉬운 건강 정보를 ‘9가지 예방수칙’과 ‘5가지 조기증상’이라는 핵심 메시지로 단순화했습니다. 누구나 쉽게 기억하고 따라 할 수 있는 친근한 콘텐츠로 풀어내는 것이 목표였습니다.",
      "영상은 한 번으로 끝나지 않았습니다. 전국 심뇌혈관질환센터로 확산되었고, 영상을 따라 하는 댄스 챌린지와 대회로 이어지며 자발적인 참여를 만들어 냈습니다.",
    ],
    reflection:
      "복잡한 정보도 대중의 눈높이로 옮겨 놓으면 사람들이 스스로 움직입니다. 잘 단순화한 메시지 하나가 전국적인 참여로 번지는 것을 확인했습니다.",
    reveals: ["캠페인 기획", "메시지 단순화", "대중 커뮤니케이션"],
  },

  /* ── 전시실 04 · 나를 움직이는 것 ────────────────────── */
  {
    id: "training-log",
    roomId: "going",
    title: "운동 기록",
    titleEn: "The Training Log",
    tagline: "잘한 날이 아니라 한 날을 적는다.",
    glyph: "log",
    crop: "landscape",
    image: "training-log.jpg",
    imageAlt: "운동 기록을 적어 둔 노트",
    caption: "개인 기록",
    object:
      "운동 기록은 성적표가 아닙니다. 어떤 날에는 ‘했다’는 사실 하나만 적혀 있습니다. 그런 줄이 길어지는 것만으로 다음 주가 조금 쉬워집니다.",
    story: [
      "기록을 남기기 시작하면 스스로에 대해 알게 되는 것이 생깁니다. 어떤 주에 빠지는지, 무엇이 자주 핑계가 되는지 같은 것들입니다.",
      "목표를 세우는 일과 지키는 일은 다른 능력입니다. 기록은 두 번째 쪽을 도와주는 장치에 가깝습니다.",
    ],
    reflection:
      "업무에서도 같은 방식을 씁니다. 계획표보다 실제로 한 일을 적어 둔 기록이 더 정확합니다.",
    reveals: ["목표 관리", "자기 관찰"],
  },
  {
    id: "mba-people",
    roomId: "going",
    title: "같이 공부하는 사람들",
    titleEn: "The People I Study With",
    tagline: "책보다 더 많이 배우게 되는 자리.",
    glyph: "people",
    crop: "landscape",
    image: "mba-people.jpg",
    imageAlt: "MBA 과정에서 함께 공부하는 사람들",
    caption: "함께 공부한 기록",
    object:
      "MBA 과정에서 만난 사람들입니다. 강의실에서 배운 것 못지않게, 이 사람들에게서 얻은 것이 많습니다.",
    story: [
      "서로 다른 업계와 직무에서 온 사람들이 모여 있다 보니, 같은 문제를 꺼내도 돌아오는 답이 저마다 다릅니다. 그 차이를 듣다 보면 제가 당연하게 여기던 전제가 한 번씩 흔들립니다.",
      "좋은 사람들을 만난 것이 이 과정에서 얻은 가장 큰 수확입니다. 책에서 읽은 개념보다, 그 개념을 실제로 써 본 사람의 이야기가 더 오래 남습니다.",
    ],
    reflection:
      "배움은 혼자 읽는 시간보다 좋은 사람들 옆에 있는 시간에서 더 많이 옵니다. 어떤 사람들 사이에 있는지가 어떤 질문을 하게 되는지를 정한다고 생각합니다.",
    reveals: ["MBA 과정", "사람에게 배우기", "관점의 확장"],
  },

  /* ── 전시실 05 · 아직 되어가는 중 ────────────────────── */
  {
    id: "empty-frame",
    roomId: "becoming",
    title: "빈 액자",
    titleEn: "The Empty Frame",
    tagline: "아직 일어나지 않은 일을 위한 자리.",
    glyph: "frame",
    crop: "tall",
    image: "",
    imageAlt: "",
    caption: "의도적으로 비워 둔 전시 자리",
    object:
      "마지막 자리는 비어 있습니다. 채우지 못한 것이 아니라, 아직 일어나지 않은 일을 위해 비워 둔 자리입니다.",
    story: [
      "박물관은 보통 끝난 일을 전시합니다. 하지만 사람의 전시에는 끝나지 않은 칸이 필요합니다.",
      "몇 년 뒤 이 액자에 무엇이 걸릴지는 지금 하고 있는 선택들이 결정할 것입니다.",
    ],
    reflection:
      "이 전시의 결론은 완성된 목록이 아닙니다. 지금도 바뀌는 중이라는 사실 자체가 전시하려던 내용입니다.",
    reveals: ["성장", "열린 결말"],
    noPhoto: true,
  },
];

/* ── 3. 맺음말 (마지막 전시실 아래에 표시) ─────────────── */
const CLOSING = {
  roomId: "becoming",
  title: "여기까지가 지금까지의 나입니다.",
  body: "{전시품수} 점의 전시품은 서로 다른 시기에 생긴 것들입니다. 한자리에 모아 놓고 보니 결국 한 사람이 비슷한 방식으로 선택해 온 기록이었습니다. 숫자를 한 번 더 확인하고, 설명되지 않는 단계에 질문을 남기고, 하기 싫은 날에도 같은 자리로 돌아오는 방식입니다.",
  quote:
    "이것은 화면에 옮겨 둔 이력서가 아닙니다. 나를 만들어 온 것들, 그리고 지금도 되어가는 중인 사람에 대한 전시입니다.",
  sign: "THE MUSEUM OF ME · 양경준",
};

/* ============================================================
   여기서부터는 UI 구현 코드입니다. 글을 고칠 때는 수정하지 않아도 됩니다.
   ============================================================ */

/* ── 전시품 번호 자동 매기기 ──────────────────────────────
   EXHIBITS 에 적힌 순서대로 001, 002, … 가 붙습니다.
   전시품을 추가·삭제하거나 순서를 바꿔도 번호는 알아서 맞춰지므로
   위 데이터에는 번호를 적지 않습니다.                        */
EXHIBITS.forEach((ex, i) => {
  ex.number = String(i + 1).padStart(3, "0");
});

/* ── 글 속의 {전시품수} 채우기 ────────────────────────────
   전시실 소개문에서는 그 전시실의 전시품 수, 맺음말에서는 전체 수로
   바뀝니다. 숫자 대신 우리말로 적히므로 그대로 문장에 녹습니다.   */
const KO_COUNT = [
  "영", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉",
  "열", "열한", "열두", "열세", "열네", "열다섯", "열여섯", "열일곱",
  "열여덟", "열아홉", "스무",
];

function fillCount(text, n) {
  return String(text == null ? "" : text)
    .replace(/\{전시품수\}/g, KO_COUNT[n] || String(n))
    .replace(/\{숫자\}/g, String(n));
}

/* ── 선화 (사진이 아직 없을 때 자리를 지키는 그림) ───────── */
const SVG_OPEN =
  '<svg class="{CLS}" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';

const GLYPHS = {
  photo:
    '<rect x="18" y="24" width="84" height="72"/><path d="M26 82l20-22 14 14 10-10 16 18"/><circle cx="80" cy="44" r="7"/>',
  cap: '<path d="M16 48L60 28l44 20-44 20z"/><path d="M32 58v22c0 6 13 10 28 10s28-4 28-10V58"/><path d="M104 48v20"/><circle cx="104" cy="72" r="3.5"/>',
  door: '<rect x="32" y="16" width="56" height="88"/><rect x="40" y="24" width="40" height="64"/><circle cx="73" cy="60" r="3"/><path d="M14 104h92"/>',
  calculator:
    '<rect x="32" y="14" width="56" height="92" rx="3"/><rect x="40" y="22" width="40" height="18"/><path d="M40 54h8M56 54h8M72 54h8M40 68h8M56 68h8M72 68h8M40 82h8M56 82h8M72 82h8M40 96h24M72 96h8"/>',
  question:
    '<path d="M26 24h58l10 10v62H26z"/><path d="M84 24v10h10"/><path d="M50 52a10 10 0 1 1 13 9.6c-2.6.9-3.6 2.6-3.6 5.4v3"/><circle cx="59.4" cy="80" r="2.6" fill="currentColor" stroke="none"/>',
  tool: '<rect x="14" y="26" width="92" height="68" rx="2"/><path d="M14 42h92"/><circle cx="24" cy="34" r="2.6" fill="currentColor" stroke="none"/><circle cx="33" cy="34" r="2.6" fill="currentColor" stroke="none"/><circle cx="60" cy="68" r="12"/><path d="M60 50v6M60 80v6M42 68h6M72 68h6M47 55l4 4M69 77l4 4M73 55l-4 4M51 77l-4 4"/>',
  campaign:
    '<circle cx="42" cy="60" r="22"/><path d="M36 51l16 9-16 9z"/><path d="M72 44a26 26 0 0 1 0 32"/><path d="M85 34a42 42 0 0 1 0 52"/><path d="M98 24a58 58 0 0 1 0 72"/>',
  log: '<rect x="26" y="20" width="68" height="84" rx="2"/><rect x="48" y="12" width="24" height="12" rx="2"/><path d="M38 44h8l6 8 10-16"/><path d="M68 44h18M38 66h8M68 66h18M38 86h8M68 86h18"/><path d="M52 66l10-10"/>',
  people:
    '<circle cx="60" cy="40" r="13"/><path d="M36 80c0-13 11-22 24-22s24 9 24 22"/><circle cx="24" cy="54" r="9"/><path d="M8 84c0-10 7-17 16-17"/><circle cx="96" cy="54" r="9"/><path d="M112 84c0-10-7-17-16-17"/>',
  frame:
    '<path d="M60 10v12"/><circle cx="60" cy="8" r="3"/><rect x="22" y="24" width="76" height="84"/><rect x="34" y="36" width="52" height="60" stroke-dasharray="5 6"/>',
};

function glyphSVG(name, cls) {
  const inner = GLYPHS[name] || GLYPHS.frame;
  return (
    SVG_OPEN.replace("{CLS}", cls || "exhibit-art-line") + inner + "</svg>"
  );
}

/* ── 유틸 ──────────────────────────────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const esc = (str) =>
  String(str == null ? "" : str).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/** 문단 배열을 <p> 로 렌더 */
function renderProse(parts) {
  const list = Array.isArray(parts) ? parts : [parts];
  return list
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

const roomById = (id) => ROOMS.find((r) => r.id === id);
const exhibitById = (id) => EXHIBITS.find((e) => e.id === id);
const exhibitsOfRoom = (roomId) => EXHIBITS.filter((e) => e.roomId === roomId);

/* ── 상태 ──────────────────────────────────────────────── */
const state = {
  view: "entrance",
  roomId: null,
  exhibitId: null,
  visited: new Set(),
  lastTrigger: null,
  exhibitRouteWasPushed: false,
};

/* ── DOM 참조 ─────────────────────────────────────────── */
const views = {
  entrance: $("#view-entrance"),
  map: $("#view-map"),
  room: $("#view-room"),
};
const exhibitOverlay = $("#exhibit-overlay");
const exhibitPanel = $("#exhibit-panel");
const audio = $("#ambience");

/* ── 이미지 + 선화 폴백 ───────────────────────────────── */
/** 사진이 없거나 로드에 실패하면, 아이콘 장식이 아니라
    '교체 예정인 빈 자리'로 보이게 둔다. (assets/images/ 에 파일을
    넣으면 코드를 고치지 않아도 사진으로 바뀐다)                  */
function mountArt(container, ex, cls) {
  const clear = () => {
    Array.from(container.children).forEach((node) => {
      if (!node.classList.contains("exhibit__flag")) node.remove();
    });
  };

  clear();
  container.classList.remove("is-pending");
  container.removeAttribute("data-pending");

  const pending = () => {
    clear();
    container.classList.add("is-pending");
    container.setAttribute(
      "data-pending",
      ex.noPhoto ? "비워 둔 자리" : "사진 준비 중",
    );
    container.insertAdjacentHTML("afterbegin", glyphSVG(ex.glyph, cls));
  };

  if (!ex.image || ex.noPhoto) {
    pending();
    return;
  }

  const img = document.createElement("img");
  img.className = "exhibit__img";
  img.alt = ex.imageAlt || ex.title;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", pending, { once: true });
  img.src = CONFIG.imageBase + ex.image;
  container.appendChild(img);
}

/* ── 전시실 안내 렌더 ───────────────────────────────────
   카드를 반복하지 않고, 번호·제목·질문이 이어지는 편집형 색인으로
   만든다. 오른쪽 평면도와 서로 연동된다.                       */
function renderIndex() {
  const list = $("#roomindex");
  list.innerHTML = ROOMS.map((room) => {
    const count = exhibitsOfRoom(room.id).length;
    return `
      <li>
        <button class="roomrow" type="button" data-room="${room.id}"
                aria-label="전시실 ${room.number} ${esc(room.title)} — ${esc(room.question)}">
          <span class="roomrow__num">${room.number}</span>
          <span class="roomrow__body">
            <span class="roomrow__title">${esc(room.title)}</span>
            <span class="roomrow__en" lang="en">${esc(room.titleEn)}</span>
            <span class="roomrow__q">${esc(room.question)}</span>
          </span>
          <span class="roomrow__meta">
            <span>전시품 ${count}점</span>
            <span data-room-badge="${room.id}"></span>
          </span>
        </button>
      </li>`;
  }).join("");

  updateVisitedBadges();
}

/** 목록에서 가리키고 있는 전시실에 평면도의 조명을 맞춘다. */
function highlightPlan(roomId) {
  const plan = $("#floorplan");
  if (!plan) return;

  if (roomId) plan.setAttribute("data-active", roomId);
  else plan.removeAttribute("data-active");

  $$("[data-plan]", plan).forEach((g) =>
    g.classList.toggle("is-active", g.getAttribute("data-plan") === roomId),
  );
}

function updateVisitedBadges() {
  $$("[data-room-badge]").forEach((el) => {
    const id = el.getAttribute("data-room-badge");
    const seen = state.visited.has(id);
    el.className = seen
      ? "roomrow__state roomrow__state--seen"
      : "roomrow__state";
    el.textContent = seen ? "관람함" : "들어가기";
  });

  $$("[data-plan]").forEach((g) =>
    g.classList.toggle(
      "is-visited",
      state.visited.has(g.getAttribute("data-plan")),
    ),
  );

  const count = $("[data-progress-count]");
  if (count) count.textContent = String(state.visited.size);
}

/* ── 전시실 렌더 ──────────────────────────────────────── */
function renderRoom(roomId) {
  const room = roomById(roomId);
  if (!room) return false;

  const view = views.room;
  // 조명(tone)과 전시 구성(layout)을 전시실에 맞춰 바꾼다.
  view.setAttribute("data-tone", room.tone);
  view.setAttribute("data-layout", room.layout || "archive");
  document.body.setAttribute("data-tone", room.tone);

  const list = exhibitsOfRoom(roomId);

  $("[data-room-numeral]", view).textContent = room.number;
  $("[data-room-en]", view).textContent = room.titleEn;
  $("[data-room-title]", view).textContent = room.title;
  $("[data-room-question]", view).textContent = room.question;
  $("[data-room-intro]", view).textContent = fillCount(room.intro, list.length);
  $("[data-room-count]", view).textContent = `전시품 ${list.length}점`;
  $("#topbar-location").textContent = `전시실 ${room.number} · ${room.title}`;

  const grid = $("#exhibitgrid");
  grid.innerHTML = list
    .map(
      (ex) => `
      <li>
        <button class="exhibit" type="button" data-exhibit="${ex.id}" data-crop="${ex.crop || "portrait"}"
                aria-label="전시품 ${ex.number} ${esc(ex.title)} — 자세히 보기">
          <span class="exhibit__art" data-art="${ex.id}">
            ${ex.status ? `<span class="exhibit__flag">${esc(ex.status)}</span>` : ""}
          </span>
          <span class="exhibit__label">
            <span class="exhibit__num">${ex.number}</span>
            <span class="exhibit__name">${esc(ex.title)}</span>
            <span class="exhibit__line">${esc(ex.tagline)}</span>
            <span class="exhibit__rule"></span>
          </span>
        </button>
      </li>`,
    )
    .join("");

  list.forEach((ex) => {
    mountArt($(`[data-art="${ex.id}"]`, grid), ex, "exhibit-art-line");
  });

  // 맺음말 (마지막 전시실에서만)
  const closing = $("[data-closing]", view);
  if (CLOSING && CLOSING.roomId === roomId) {
    $("[data-closing-title]", view).textContent = CLOSING.title;
    $("[data-closing-body]", view).textContent = fillCount(
      CLOSING.body,
      EXHIBITS.length,
    );
    $("[data-closing-quote]", view).textContent = CLOSING.quote;
    $("[data-closing-sign]", view).textContent = CLOSING.sign;
    closing.hidden = false;
  } else {
    closing.hidden = true;
  }

  // 이전/다음 전시실
  const idx = ROOMS.findIndex((r) => r.id === roomId);
  const prev = ROOMS[idx - 1];
  const next = ROOMS[idx + 1];

  $('[data-action="prev-room"]', view).disabled = !prev;
  $('[data-action="next-room"]', view).disabled = !next;
  $("[data-prev-room-label]", view).textContent = prev
    ? `${prev.number} ${prev.title}`
    : "없음";
  $("[data-next-room-label]", view).textContent = next
    ? `${next.number} ${next.title}`
    : "없음";

  state.visited.add(roomId);
  updateVisitedBadges();
  return true;
}

/* ── 전시품 상세 ──────────────────────────────────────── */
function renderExhibit(ex) {
  const room = roomById(ex.roomId);
  const p = exhibitPanel;

  p.setAttribute("data-crop", ex.crop || "portrait");
  mountArt($("[data-exhibit-frame]", p), ex, "stage-art-line");
  // 캡션 앞의 "전시품 006 ·" 은 번호에서 자동으로 만들어진다.
  $("[data-exhibit-caption]", p).textContent = ex.caption
    ? `전시품 ${ex.number} · ${ex.caption}`
    : `전시품 ${ex.number}`;
  $("[data-exhibit-number]", p).textContent = ex.number;
  $("[data-exhibit-room]", p).textContent = room
    ? `전시실 ${room.number} · ${room.title}`
    : "";
  $("[data-exhibit-title]", p).textContent = ex.title;
  $("[data-exhibit-subtitle]", p).textContent = ex.titleEn || "";

  $("[data-exhibit-object]", p).textContent = ex.object || "";
  $("[data-exhibit-story]", p).innerHTML = renderProse(ex.story);

  const more = $("[data-exhibit-more]", p);
  if (ex.more && ex.more.length) {
    $("[data-exhibit-more-body]", p).innerHTML = renderProse(ex.more);
    more.hidden = false;
    more.open = false;
  } else {
    more.hidden = true;
  }

  $("[data-exhibit-reflection]", p).textContent = ex.reflection || "";
  $("[data-exhibit-tags]", p).innerHTML = (ex.reveals || [])
    .map((t) => `<li>${esc(t)}</li>`)
    .join("");

  const figBlock = $("[data-exhibit-figures-block]", p);
  if (ex.figures && ex.figures.length) {
    $("[data-exhibit-figures]", p).innerHTML = ex.figures
      .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
      .join("");
    $("[data-exhibit-figures-note]", p).textContent = ex.figuresNote || "";
    figBlock.hidden = false;
  } else {
    figBlock.hidden = true;
  }

  // 화살표가 전시 전체를 도므로 위치도 전체 기준으로 보여 준다.
  const pos = EXHIBITS.findIndex((e) => e.id === ex.id) + 1;
  $("[data-exhibit-pos]", p).textContent = `${pos} / ${EXHIBITS.length}`;

  // 전시품이 바뀔 때 조명이 한 번 바뀌는 정도의 짧은 전환
  const spread = $(".stage__spread", p);
  spread.classList.remove("is-fresh");
  void spread.offsetWidth;
  spread.classList.add("is-fresh");
}

/** 패널을 화면에 띄운다. 라우트(applyRoute)에서만 호출된다. */
function openExhibit(id) {
  const ex = exhibitById(id);
  if (!ex) return;

  state.exhibitId = id;
  renderExhibit(ex);

  if (exhibitOverlay.hidden) {
    exhibitOverlay.hidden = false;
    document.body.classList.add("is-locked");
    exhibitPanel.focus();
  }
  $("[data-stage-scroll]", exhibitPanel).scrollTop = 0;
}

/** 패널만 숨긴다(라우팅은 하지 않는다). */
function hideExhibit() {
  if (exhibitOverlay.hidden) return;
  exhibitOverlay.hidden = true;
  document.body.classList.remove("is-locked");
  state.exhibitId = null;

  if (state.lastTrigger && document.contains(state.lastTrigger))
    state.lastTrigger.focus();
  state.lastTrigger = null;
}

/** 사용자가 닫기를 눌렀을 때: 히스토리를 되돌리거나 전시실 경로로 교체한다. */
function closeExhibit() {
  if (exhibitOverlay.hidden) return;
  const roomId =
    state.roomId || (exhibitById(state.exhibitId) || {}).roomId || ROOMS[0].id;

  if (state.exhibitRouteWasPushed) {
    state.exhibitRouteWasPushed = false;
    history.back(); // hashchange → applyRoute → hideExhibit()
  } else {
    history.replaceState(null, "", `#/room/${roomId}`);
    hideExhibit();
  }
}

/** 화살표 하나로 전시 전체를 돈다.
    전시실 끝에 닿으면 다음 전시실의 첫 전시품으로 그대로 이어지고,
    마지막 전시품에서 한 번 더 누르면 처음으로 돌아온다.          */
function stepExhibit(dir) {
  const ex = exhibitById(state.exhibitId);
  if (!ex) return;

  const i = EXHIBITS.findIndex((e) => e.id === ex.id);
  const next = EXHIBITS[(i + dir + EXHIBITS.length) % EXHIBITS.length];
  if (!next || next.id === ex.id) return;

  // 전시실이 바뀌면 뒤에 깔린 전시실도 함께 바꿔 둔다.
  // (닫았을 때 엉뚱한 전시실에 서 있지 않도록)
  if (next.roomId !== state.roomId) {
    renderRoom(next.roomId);
    state.roomId = next.roomId;
    showView("room");
  }

  history.replaceState(null, "", `#/room/${next.roomId}/${next.id}`);
  openExhibit(next.id);
}

/* ── 뷰 전환 ──────────────────────────────────────────── */
function showView(name) {
  state.view = name;
  Object.entries(views).forEach(([key, el]) => {
    const active = key === name;
    el.hidden = !active;
    el.classList.remove("is-active");
    if (active) {
      void el.offsetWidth; // 전환 애니메이션 재시작
      el.classList.add("is-active");
    }
  });
  document.body.setAttribute("data-view", name);

  if (name !== "room") {
    document.body.removeAttribute("data-tone");
    views.room.removeAttribute("data-tone");
    views.room.removeAttribute("data-layout");
    $("#topbar-location").textContent = name === "map" ? "전시실 안내" : "입구";
  }
  if (name !== "map") highlightPlan(null);

  window.scrollTo({ top: 0, behavior: "auto" });
}

/* ── 라우팅 ───────────────────────────────────────────── */
/* 모든 화면 이동은 해시를 거친다: navigate() → hashchange → applyRoute() */
function navigate(hash) {
  if (location.hash === hash) applyRoute();
  else location.hash = hash;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return { view: "entrance" };
  if (parts[0] === "map") return { view: "map" };
  if (parts[0] === "room" && parts[1])
    return { view: "room", roomId: parts[1], exhibitId: parts[2] };
  return { view: "entrance" };
}

function applyRoute({ initial = false } = {}) {
  const route = parseHash();

  if (route.view === "room") {
    // 같은 전시실 안에서 전시품만 바뀔 때는 다시 그리지 않는다(스크롤·포커스 유지).
    const sameRoom = state.view === "room" && state.roomId === route.roomId;

    if (!sameRoom) {
      if (!renderRoom(route.roomId)) {
        history.replaceState(null, "", "#/map");
        hideExhibit();
        state.roomId = null;
        showView("map");
        return;
      }
      state.roomId = route.roomId;
      showView("room");
    }

    if (route.exhibitId && exhibitById(route.exhibitId)) {
      // 첫 로딩으로 들어온 전시품 주소는 뒤로가기로 사이트를 벗어날 수 있으므로 구분한다.
      if (exhibitOverlay.hidden) state.exhibitRouteWasPushed = !initial;
      openExhibit(route.exhibitId);
    } else {
      hideExhibit();
    }
    return;
  }

  hideExhibit();
  state.roomId = null;
  showView(route.view);
}

/* ── 사운드 ───────────────────────────────────────────────
   CONFIG.youtubeId 가 있으면 유튜브에서 흘려보내고, 비어 있으면
   assets/audio 의 음원 파일을 씁니다. 어느 쪽이든 조작은 같습니다.
   소리는 방문자가 버튼을 누를 때만 시작됩니다(브라우저 정책).      */
const sound = {
  ready: false,
  available: true,
  playing: false,
  mode: "file", // "youtube" | "file"
  yt: null,
  stoppedByUser: false, // 직접 끈 뒤에는 자동으로 다시 켜지 않는다

  init() {
    if (CONFIG.youtubeId) {
      this.mode = "youtube";
      this.initYouTube();
      return;
    }

    this.mode = "file";
    audio.volume = CONFIG.defaultVolume;
    audio.addEventListener("error", () => this.markUnavailable());
    audio.addEventListener("pause", () => this.sync(false));
    audio.addEventListener("play", () => this.sync(true));
    audio.addEventListener("canplay", () => {
      this.ready = true;
    });

    // 음원이 실제로 있는지 미리 확인해 둔다. 파일이 없으면 이 시점에
    // error 가 떠서 소리 버튼이 처음부터 비활성화된다. (소리는 나지 않는다)
    audio.preload = "auto";
    audio.src = CONFIG.audioSrc;
    audio.load();

    this.autostart();
  },

  /** 들어오자마자 음악이 흐르게 한다.
      브라우저는 소리 있는 자동재생을 막으므로, 먼저 그냥 시도해 보고
      거절당하면 방문자의 첫 동작(ENTER 클릭·스크롤·키 입력)에 이어서 켠다.
      소리 버튼으로 끄면 다시 자동으로 켜지지 않는다.                  */
  autostart() {
    if (this.stoppedByUser) return;

    const tryPlay = () => audio.play();

    tryPlay().catch(() => {
      // 자동재생이 막힌 경우 — 첫 동작 한 번만 기다린다.
      const events = ["pointerdown", "keydown", "touchstart", "wheel"];
      const onFirstGesture = () => {
        events.forEach((t) => document.removeEventListener(t, onFirstGesture));
        if (this.available && !this.playing && !this.stoppedByUser) tryPlay();
      };
      events.forEach((t) =>
        document.addEventListener(t, onFirstGesture, { once: false, passive: true }),
      );
    });
  },

  /** 유튜브 iframe 플레이어를 띄운다. 화면 구석에 아주 작게 둔다.
      iframe 을 직접 만드는 이유: YT API 가 만들어 주는 iframe 에는
      allow="autoplay" 가 없어서, 버튼을 눌러도 재생 권한을 받지 못한다. */
  initYouTube() {
    const start = () => {
      const host = $("#yt-player");
      if (!host) return this.markUnavailable();

      const params = new URLSearchParams({
        enablejsapi: "1",
        origin: location.origin,
        autoplay: "0",
        controls: "0",
        disablekb: "1",
        playsinline: "1",
        modestbranding: "1",
        rel: "0",
        loop: "1",
        playlist: CONFIG.youtubeId, // 한 곡 반복에 필요
      });

      const frame = document.createElement("iframe");
      frame.id = "yt-frame";
      frame.title = "배경음악";
      frame.allow = "autoplay; encrypted-media";
      frame.setAttribute("frameborder", "0");
      frame.src = `https://www.youtube.com/embed/${CONFIG.youtubeId}?${params}`;
      host.replaceChildren(frame);

      this.yt = new window.YT.Player(frame, {
        events: {
          onReady: () => {
            this.ready = true;
            this.yt.setVolume(Math.round(CONFIG.defaultVolume * 100));
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            // 버퍼링도 '켜짐'으로 본다. 곡이 뜨는 동안 버튼이 꺼져 보이지 않도록.
            if (e.data === S.PLAYING || e.data === S.BUFFERING) this.sync(true);
            else if (e.data === S.PAUSED) this.sync(false);
            else if (e.data === S.ENDED) this.yt.playVideo(); // 반복 보강
          },
          onError: () => this.markUnavailable(),
        },
      });
    };

    // API 가 이미 올라와 있으면 바로, 아니면 스크립트를 넣고 기다린다.
    if (window.YT && window.YT.Player) {
      start();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      start();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.addEventListener("error", () => this.markUnavailable());
    document.head.appendChild(tag);

    // 네트워크가 막혀 있으면 조용히 비활성화한다.
    setTimeout(() => {
      if (!this.yt) this.markUnavailable();
    }, 8000);
  },

  setStatus(msg) {
    $$("[data-sound-status]").forEach((el) => (el.textContent = msg));
  },

  sync(playing) {
    this.playing = playing;
    $$('[data-action="toggle-sound"]').forEach((btn) => {
      btn.setAttribute("aria-pressed", String(playing));
      const label = $("[data-sound-label]", btn);
      if (!label) return;
      label.textContent = btn.classList.contains("soundctl__toggle")
        ? playing
          ? "소리 켜짐"
          : "소리 꺼짐"
        : playing
          ? "배경음악 끄기"
          : "배경음악 켜기";
    });
  },

  markUnavailable() {
    if (!this.available) return;
    this.available = false;
    this.playing = false;
    if (this.mode === "file") audio.removeAttribute("src");
    $$('[data-action="toggle-sound"]').forEach((btn) => {
      btn.disabled = true;
      btn.setAttribute("aria-pressed", "false");
      const label = $("[data-sound-label]", btn);
      if (label) {
        label.textContent = btn.classList.contains("soundctl__toggle")
          ? "소리 없음"
          : "배경음악 준비 중";
      }
    });
    $$('[data-action="volume"]').forEach((el) => (el.disabled = true));
    this.setStatus(
      this.mode === "youtube"
        ? "배경음악을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요."
        : `배경음악은 나중에 추가할 수 있습니다. (${CONFIG.audioSrc} 파일을 넣으면 켜집니다)`,
    );
  },

  async toggle() {
    if (!this.available) return;

    if (this.playing) {
      this.stoppedByUser = true;
      if (this.mode === "youtube") this.yt && this.yt.pauseVideo();
      else audio.pause();
      this.setStatus("배경음악을 껐습니다. 언제든 다시 켤 수 있습니다.");
      return;
    }
    this.stoppedByUser = false;

    if (this.mode === "youtube") {
      if (!this.yt) {
        this.setStatus("배경음악을 불러오는 중입니다. 잠시 후 다시 눌러 주세요.");
        return;
      }
      this.yt.unMute();
      this.yt.playVideo();
      this.setStatus(
        "배경음악이 재생 중입니다. 음량은 옆의 조절 막대로 바꿀 수 있습니다.",
      );
      return;
    }

    // 음원은 init 에서 이미 걸어 두었다(없으면 버튼이 꺼져 여기까지 오지 않는다).
    try {
      await audio.play();
      this.setStatus(
        "배경음악이 재생 중입니다. 음량은 옆의 조절 막대로 바꿀 수 있습니다.",
      );
    } catch (err) {
      if (audio.error || !audio.src) this.markUnavailable();
      else
        this.setStatus(
          "재생을 시작하지 못했습니다. 소리 버튼을 한 번 더 눌러 주세요.",
        );
    }
  },

  setVolume(value) {
    const pct = Math.min(100, Math.max(0, Number(value)));
    if (this.mode === "youtube") {
      if (this.yt && this.yt.setVolume) this.yt.setVolume(Math.round(pct));
    } else {
      audio.volume = pct / 100;
    }
    $$('[data-action="volume"]').forEach((el) => {
      if (Number(el.value) !== Number(value)) el.value = value;
    });
  },
};

/* ── 포커스 트랩 ──────────────────────────────────────── */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function trapFocus(event, panel) {
  if (event.key !== "Tab") return;
  const items = $$(FOCUSABLE, panel).filter(
    (el) => el.offsetParent !== null || el === panel,
  );
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];

  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === panel)
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ── 이동 ─────────────────────────────────────────────── */
const goMap = () => navigate("#/map");
const goRoom = (roomId) => navigate(`#/room/${roomId}`);

/* ── 이벤트 ───────────────────────────────────────────── */
document.addEventListener("click", (event) => {
  const actionEl = event.target.closest("[data-action]");
  const roomEl = event.target.closest("[data-room]");
  const exhibitEl = event.target.closest("[data-exhibit]");

  if (exhibitEl) {
    const ex = exhibitById(exhibitEl.getAttribute("data-exhibit"));
    if (!ex) return;
    state.lastTrigger = exhibitEl;
    navigate(`#/room/${ex.roomId}/${ex.id}`);
    return;
  }
  if (roomEl) {
    goRoom(roomEl.getAttribute("data-room"));
    return;
  }
  if (!actionEl) return;

  switch (actionEl.getAttribute("data-action")) {
    case "enter":
      goMap();
      break;
    case "go-map":
      goMap();
      break;
    case "guided-tour":
      goRoom(ROOMS[0].id);
      break;
    case "prev-room": {
      const i = ROOMS.findIndex((r) => r.id === state.roomId);
      if (ROOMS[i - 1]) goRoom(ROOMS[i - 1].id);
      break;
    }
    case "next-room": {
      const i = ROOMS.findIndex((r) => r.id === state.roomId);
      if (ROOMS[i + 1]) goRoom(ROOMS[i + 1].id);
      break;
    }
    case "close-exhibit":
      closeExhibit();
      break;
    case "prev-exhibit":
      stepExhibit(-1);
      break;
    case "next-exhibit":
      stepExhibit(1);
      break;
    case "toggle-sound":
      sound.toggle();
      break;
    default:
      break;
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches('[data-action="volume"]'))
    sound.setVolume(event.target.value);
});

/* 전시실 목록 ↔ 평면도 연동 */
["pointerover", "focusin"].forEach((type) => {
  document.addEventListener(type, (event) => {
    if (state.view !== "map") return;
    const target = event.target.closest(
      "#roomindex [data-room], #floorplan [data-room]",
    );
    if (target) highlightPlan(target.getAttribute("data-room"));
  });
});
["#roomindex", "#floorplan"].forEach((sel) => {
  const el = $(sel);
  if (!el) return;
  el.addEventListener("pointerleave", () => highlightPlan(null));
  el.addEventListener("focusout", () => highlightPlan(null));
});

document.addEventListener("keydown", (event) => {
  if (!exhibitOverlay.hidden) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeExhibit();
    } else if (event.key === "ArrowLeft") {
      stepExhibit(-1);
    } else if (event.key === "ArrowRight") {
      stepExhibit(1);
    } else {
      trapFocus(event, exhibitPanel);
    }
    return;
  }

  // 전시실에서 좌우 키로 전시실 이동 (입력 요소 안에서는 제외)
  if (event.target.closest("input, textarea, select")) return;

  if (
    state.view === "room" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey
  ) {
    const i = ROOMS.findIndex((r) => r.id === state.roomId);
    if (event.key === "ArrowLeft" && ROOMS[i - 1]) goRoom(ROOMS[i - 1].id);
    if (event.key === "ArrowRight" && ROOMS[i + 1]) goRoom(ROOMS[i + 1].id);
  }
});

window.addEventListener("hashchange", () => applyRoute());

/* ── 초기화 ───────────────────────────────────────────── */
function init() {
  renderIndex();

  sound.init();
  sound.setVolume(CONFIG.defaultVolume * 100);

  applyRoute({ initial: true });
}

init();
