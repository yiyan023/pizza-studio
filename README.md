# [Pizza Studio](https://devpost.com/software/pizza-studio-spnuoh?ref_content=my-projects-tab&ref_feature=my_projects)

## Tech Stack 💻

**Front-end**: React Native Expo, TypeScript, Tamagui

**Back-end + APIs**: Python, Flask, MongoDB, Amazon Web Services, Hume AI, OpenAI, Deepgram AI, Twilio, and more!

**Design**: Figma ([Link to Figma](https://www.figma.com/design/pD5iPyeioum5JHwFBQre92/web-design?node-id=7-122&t=rOO81TlivDWUq7LY-1))

## Inspiration 💡
In Canada, a staggering 46.2 million women aged 15 and older have reported experiencing abuse in intimate partner relationships. For many, domestic and sexual violence are harsh realities that women face every day. When these distressing situations escalate to legal confrontations, the unfortunate truth remains that a man's word is worth significantly more. Hence, we built Pizza Studio, a cleverly disguised pizza-ordering platform that looks like your neighborhood Domino's. It helps women collect crucial evidence during dire situations where no one believes her word.

## What it does 🚀
Users must first log in to gain access to their files, record audio clips and upload images for evidence collection.
Once users are redirected to the front page, they have the option of purchasing a pizza. By "purchasing a pizza", this triggers the microphone to start recording audio input, which will be routed to the backend by Flask and saved to the database as potential evidence.
"Reviewing order history" allows you to access previous audio files, and gain access to transcripts & analysis of the level of danger the victim is in.
Depending on the level of danger the victim is in, a selected friend will receive an automated text message warning them about the user's potential risk.

## How we built it 🔧
React-Native and Expo were used to build our mobile interface, allowing our users to have an interactive, and pizza-full experience! It also allows our users to record themselves & add these files to the backend.
Flask, MongoDB and AWS S3 were used for database storage and server-side routing, which allowed us to make various API calls & take user inputs for backend manipulation. This includes user authentication and file storage for evidence collection.
We also used various APIs (i.e. Twilio, Tamagui) to add some fiery features to spice up our platform!

## Challenges we ran into 😥
Integrating front-end and back-end applications is always tricky, but through error analysis and patience, we were able to figure things out! When we were thinking of our idea, we got excited by the concept of voice triggers and auto-detection. However, as we continued building the project, we realized that it was not feasible and had to adapt to our current circumstances by changing our features.

## Accomplishments that we're proud of 💪
Nine hours before the hackathon, we thought that there was no way we were going to finish this project. But despite how pessimistic we were, we all decided to stay up and challenge ourselves, leading us to build a product that can help millions of women who face abuse every day.

## What we learned 🍎
The importance of collaboration and communication. Despite struggling for most of the hackathon, we were able to finish most of the features we wanted to incorporate within the last five hours of the hackathon.
The importance of taking breaks and practicing patience during debugging. While many resources allow us to learn on the go, we all ran into different bugs throughout this journey. By using critical thinking skills and taking breaks, we were able to get past any obstacles thrown at us :).

## What's next for Pizza Studio🍕
Enabling voice triggers so the user can collect evidence from a safe word without manually picking up the phone. We are also looking to incorporate an initial tutorial so users can understand the underlying meaning behind our disguised features.
