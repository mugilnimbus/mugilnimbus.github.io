# Thursday

A personal AI agent with two modes: it can see and control a computer, and it can be spoken to hands-free from a phone.

This one project replaces the three earlier entries: Thursday, Thursday V2 and Thursday V3.

## Modes

| Mode | What the user does | What Thursday does |
| --- | --- | --- |
| Computer control | Gives a task | Reads the screen, decides an action, performs it, and repeats until the task is done |
| Voice agent *(in progress)* | Talks to a phone, hands-free | Replies by voice, hands real work to a main agent, and asks for permission by voice |

## Mode 1: Computer control

Thursday works from what is on the screen. It looks, reads, finds every control, decides, acts, then looks again.

```text
User task
   |
   v
Capture screen or region --> Line OCR -------------> text lines ----------+
          |                                                               |
          +-----------------> Object detection ----> objects + boxes -----+
                              (OmniParser)                                |
                                                                          v
                                                     LLM  <---------- user task
                                                      |
                                       action + target object (tool call)
                                                      |
                                                      v
                                    Tool: ground object -> exact screen coordinates
                                                      |
                                                      v
                                    Perform action (click, type, ...)
                                                      |
                                          +-----------+-----------+
                                          |                       |
                                     not finished             finished, or
                                          |                   needs information
                                          v                       |
                                   capture again                  v
                                                          reply to the user,
                                                          or ask a question
```

### Steps

1. **Task.** The user gives Thursday a task.
2. **Capture.** Thursday takes a screenshot of the whole screen or of the relevant area.
3. **Read the text.** The screenshot goes through a line OCR model, which extracts every line of text on screen.
4. **Find the controls.** The same screenshot goes through an object detection model (OmniParser). It detects every button, icon, message and input box, with the exact coordinates of each.
5. **Decide.** Three inputs go to the LLM together: the text lines, the detected objects with their coordinates, and the user's task. The LLM looks at the screen through this data and decides the next action and the object to act on.
6. **Call the tool.** The LLM sends the action and the chosen object through a tool call.
7. **Ground.** The tool resolves the chosen object to its exact coordinates on the real screen, taking the captured area into account.
8. **Act.** The tool performs the action at those coordinates: a click, typing, and so on.
9. **Loop.** Thursday captures the screen again, and steps 3 to 8 repeat with the new screen.
10. **Finish.** When the task is complete, Thursday replies to the user. If it needs more information at any point, it asks the user instead.

### The idea that matters

The LLM never guesses pixel positions. It chooses from objects that were detected and measured on the current screen, and a tool turns that choice into exact coordinates. Every action is followed by a fresh look at the screen, so the next decision is always based on what actually happened.

## Mode 2: Voice agent *(in progress)*

Show this mode on the site with an "In progress" mark beside its name.

A completely hands-free agent. The user talks through a phone; Thursday answers by voice.

```text
Phone (user speaks)
   |
   v
Voice model (speech in, speech out, full-duplex capable)
   |
   +-- can answer directly --> speaks the reply
   |
   +-- needs real work ----> A2A delegation ----> Main agent
                                                     |
                                                runs the task with tools
                                                     |
                     needs permission? <--------------+
                            |
                  voice model asks the user by voice
                            |
                  spoken answer --> sent back to the tool server
                                                     |
                                    result or question back to the voice model
                                                     |
                                                     v
                                         voice model speaks to the user
```

### Steps

1. **Speak.** The user talks to Thursday through the mobile app. There is no screen to look at and nothing to tap.
2. **Voice model.** A speech-to-speech voice model listens and replies. It supports full-duplex conversation: it can listen and speak at the same time.
3. **Decide to delegate.** For every request, the voice model decides whether it can answer itself or whether the main agent must do a task.
4. **Delegate through A2A.** Every task for the main agent is sent through the A2A (agent-to-agent) protocol, with proper delegation.
5. **Main agent works.** The main agent, running in the background, does the actual work with its tools.
6. **Permission by voice.** When an action needs the user's permission, the request comes back to the voice model, which asks the user out loud. The user's spoken answer is sent back to the tool server.
7. **Report back.** The main agent returns results, or questions it needs answered, to the voice model.
8. **Reply.** The voice model speaks the result to the user.

### The idea that matters

Two models, two jobs. The voice model stays fast and conversational; the main agent does the slow, careful work. They talk through a standard agent-to-agent protocol, so the conversation never stalls while work runs, and nothing sensitive happens without a spoken yes.

## Animation brief

Clean, neat and step by step, showing exactly what happens inside the system. One step on screen at a time, in the order of the steps above.

| Scene | Shows |
| --- | --- |
| 1 | A screen is captured; the captured area is outlined |
| 2 | Line OCR draws a line under each line of text, which lifts out as a text list |
| 3 | Object detection draws a box around each button, icon, message and input box, each labelled with its coordinates |
| 4 | Text list, object list and the user's task flow into the LLM |
| 5 | The LLM outputs an action and a target object as a tool call |
| 6 | The tool maps the object to a point on the screen; the cursor moves there and acts |
| 7 | The screen changes and the loop runs again, faster |
| 8 | The task finishes and a reply returns to the user |
| 9 | Voice mode, marked "In progress": a phone, a voice wave, the voice model |
| 10 | The voice model hands a task to the main agent over A2A |
| 11 | A permission request returns; the phone asks; a spoken yes travels back to the tool server |
| 12 | The result returns to the voice model and is spoken to the user |

## Open questions

1. Which LLM does each mode use, and does it run locally?
2. Which line OCR model is used?
3. Which actions can the tool perform: click, double-click, type, scroll, keyboard shortcuts, others?
4. Does the voice agent's main agent use computer control for its tasks, or a separate set of tools?
5. Which voice model is used, and does the main agent run on the same machine as the computer being controlled?
6. Is there a result or measurement worth showing, for example tasks completed, steps per task, or response time?
7. Which public repository should the project link to: Thursday, Thursday_V2, Thursday_V3, or a new one?
