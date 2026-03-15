from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from .rag_retriever import EduRPGRetriever

TUTOR_PROMPT = ChatPromptTemplate.from_template(
    """
    You are an expert AI tutor for EduRPG, a gamified learning platform.
    The student is Level {level} and is studying {subject}.

    Context from course materials:
    {context}

    The student answered a question INCORRECTLY.
    Question: {question}
    Their answer: {student_answer}
    Correct answer: {correct_answer}

    Explain WHY their answer was wrong, step by step.
    Use simple language. Keep it under 5 sentences.
    End with an encouraging message."""
)

class AITutorService:
    def __init__(self):
        self.llm = ChatOpenAI(model='gpt-4o', temperature=0.3)
        self.retriever = EduRPGRetriever()
        self.chain = (
            RunnablePassthrough.assign(
                context=lambda x: self.retriever.get_context(x['question'])
            )
            | TUTOR_PROMPT
            | self.llm
        )

    async def explain_wrong_answer(
        self, question: str, student_answer: str,
        correct_answer: str, subject: str, level: int
    ) -> str:
        result = await self.chain.ainvoke({
            'question': question,
            'student_answer': student_answer,
            'correct_answer': correct_answer,
            'subject': subject,
            'level': level
        })
        return result.content

    async def get_hint(self, question: str, subject: str) -> str:
        prompt = f'Give one short hint for: {question} (subject: {subject}). Max 2 sentences.'
        result = await self.llm.ainvoke(prompt)
        return result.content

    async def generate_quiz(self, topic: str, difficulty: int) -> list[dict]:
        prompt = f'''Generate 5 multiple-choice questions about {topic}.
        Difficulty level: {difficulty}/5. Return JSON array:,
        [{{'question': ..., 'options': [...], 'correct_index': 0, 'explanation': ...}}]'''
        result = await self.llm.ainvoke(prompt)
        return parse_json(result.content)
