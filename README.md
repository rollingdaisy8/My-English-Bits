# My English Bits

내가 실제로 말한 영어를 자연스러운 표현으로 바꿔 저장하고 반복 연습하는 초간단 웹앱 프로토타입입니다.

## 기능
- ChatGPT에서 만든 JSON 표현 묶음 붙여넣기
- 직접 표현 추가
- 최근 표현 보기
- 전체 라이브러리 / 검색
- 즐겨찾기
- 삭제
- 랜덤 복습
- 연습 횟수 기록
- 다크모드
- 브라우저 localStorage 저장

## GitHub Pages에 올리는 법
1. GitHub에서 새 repository 생성
2. 이 폴더 안의 `index.html`, `style.css`, `app.js`를 업로드
3. Repository → Settings → Pages
4. Branch를 `main`, Folder를 `/root`로 선택 후 Save
5. 잠시 기다리면 GitHub Pages 링크가 생성됨

## ChatGPT와 함께 쓰는 추천 방법
10분 프리토킹 후 ChatGPT에 아래처럼 요청:

`오늘 내가 말한 문장 중 실생활에서 자주 쓰는 자연스러운 표현만 골라서 My English Bits용 JSON으로 정리해줘.`

JSON 형식:

```json
[
  {
    "original": "내가 실제로 말한 문장",
    "natural": "가장 자연스러운 영어",
    "alternative": "다른 자연스러운 표현",
    "meaning": "한국어 뜻",
    "context": "상황",
    "tag": "주제"
  }
]
```

그 결과를 앱의 "오늘 표현 가져오기" 칸에 붙여넣고 `JSON으로 추가`를 누르면 됩니다.

## 참고
이 버전은 서버나 회원가입이 없습니다. 데이터는 현재 브라우저의 localStorage에 저장되므로,
브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 자동으로 동기화되지 않습니다.
