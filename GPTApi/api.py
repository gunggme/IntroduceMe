from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

app = FastAPI()
client = OpenAI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventHandler(openai.AssistantEventHandler):
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def on_text_created(self, text) -> None:
        await self.websocket.send_text(f"\nassistant > {text}")

    async def on_text_delta(self, delta, snapshot):
        await self.websocket.send_text(delta.value)

    async def on_tool_call_created(self, tool_call):
        await self.websocket.send_text(f"\nassistant > {tool_call.type}\n")

    async def on_tool_call_delta(self, delta, snapshot):
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                await self.websocket.send_text(delta.code_interpreter.input)
            if delta.code_interpreter.outputs:
                await self.websocket.send_text(f"\n\noutput >")
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        await self.websocket.send_text(output.logs)

@app.post("/create_thread")
async def create_thread():
    # Simulate Thread ID generation
    thread_id = client.beta.threads.create()  # Replace with actual logic to generate thread_id
    return {"thread_id": thread_id}

@app.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    await websocket.accept()
    event_handler = EventHandler(websocket)

    try:
        # Replace with your actual assistant and thread IDs and instructions
        assistant_id = "your_assistant_id"
        instructions = "Please address the user as Jane Doe. The user has a premium account."

        with OpenAI.client.beta.threads.runs.stream(
            thread_id=thread_id,
            assistant_id=assistant_id,
            instructions=instructions,
            event_handler=event_handler
        ) as stream:
            stream.until_done()
    except WebSocketDisconnect:
        print("Client disconnected")
