from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing_extensions import override
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from openai import OpenAI
from openai import AssistantEventHandler

assistant_id = "asst_wxnRIDpHA61st02LpONtxmkn"

app = FastAPI()
client = OpenAI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def send_text(self, msg: str):
    asyncio.create_task(self.websocket.send_text(msg))

class EventHandler(AssistantEventHandler):
    def __init__(self, websocket: WebSocket):
        super().__init__()
        self.websocket = websocket
        
    @override
    def on_text_created(self, text) -> None:
        print("시작")

    @override
    def on_text_delta(self, delta, snapshot):
        print(delta.value, end="", flush=True)
        asyncio.create_task(self.websocket.send_text(delta.value))

           
    @override
    def on_tool_call_created(self, tool_call):
        print(f"\nassistant > {tool_call.type}\n\\n", flush=True)
        asyncio.create_task(self.websocket.send_text(tool_call))


    # @override
    # def on_tool_call_delta(self, delta, snapshot):
    #     if delta.type == 'code_interpreter':
    #         if delta.code_interpreter.input:
    #             print(delta.code_interpreter.input, end="", flush=True)
    #             asyncio.create_task(self.websocket.send_text(delta.code_interpreter.input))
    #         if delta.code_interpreter.outputs:
    #             print(f"\n\noutput >", flush=True)
    #             asyncio.create_task(self.websocket.send_text(f"\n\noutput >"))
    #             for output in delta.code_interpreter.outputs:
    #                 if output.type == "logs":
    #                     print(f"\n{output.logs}", flush=True)
    #                     asyncio.create_task(self.websocket.send_text(output.logs))

@app.post("/create_thread")
async def create_thread():
    # Simulate Thread ID generation
    thread_id = client.beta.threads.create()  # Replace with actual logic to generate thread_id
    return {"thread_id": thread_id}

@app.post("/chat/{thread_id}")
async def Get_Message(thread_id: str):
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=assistant_id,   
    )
    if run.status == 'completed': 
        messages = client.beta.threads.messages.list(
            thread_id=thread_id
        )
        print(messages)
    else:
        print(run.status)

@app.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    print("Connecting..")
    await websocket.accept()
    print("Connected!")

    try:
        # Replace with your actual assistant and thread IDs and instructions
        
        while True:
            msg = await websocket.receive_text()
            message = client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=msg
            )
            with client.beta.threads.runs.stream(
                thread_id=thread_id,
                assistant_id=assistant_id,
                event_handler=EventHandler(websocket)
            ) as stream:
                stream.until_done()
    except WebSocketDisconnect:
        print("Client disconnected")
