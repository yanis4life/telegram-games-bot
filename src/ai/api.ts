import { AiRequest, AiResponse } from '../types';

const STATIC_FALLBACKS: Record<string, { questions: any[] }> = {
  qna: {
    questions: [
      { question: 'ما عاصفة مصر؟', options: ['القاهرة', 'الجيزة', 'الإسكندرية', 'أسوان'], correct: 'القاهرة' },
      { question: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correct: '7' },
      { question: 'من أول إنسان صعد إلى الفضاء؟', options: ['نيل أرمسترونغ', 'يوري غاغارين', 'محمد فارس', 'توماس بيسون'], correct: 'يوري غاغارين' },
      { question: 'ما أكبر محيط في العالم؟', options: ['الأطلسي', 'الهندي', 'الهادئ', 'المتجمد الشمالي'], correct: 'الهادئ' },
      { question: 'كم عدد سور القرآن الكريم؟', options: ['110', '114', '120', '100'], correct: '114' },
    ],
  },
  whoami: {
    questions: [
      { description: 'أنا عالم مصري حصلت على جائزة نوبل في الفيزياء عام 1999', answer: 'أحمد زويل' },
      { description: 'أنا قائد عربي حررت القدس من الصليبيين', answer: 'صلاح الدين الأيوبي' },
      { description: 'أنا كاتب مصري حصلت على جائزة نوبل في الأدب عام 1988', answer: 'نجيب محفوظ' },
      { description: 'أنا عالم مسلم كتبت كتاب "الحاوي" في الطب', answer: 'الرازي' },
      { description: 'أنا شاعر عربي لقبت بالأمير', answer: 'أحمد شوقي' },
    ],
  },
  proverb: {
    questions: [
      { first: 'إذا كان الكلام من فضة', answer: 'فالسكوت من ذهب' },
      { first: 'في التأني السلامة', answer: 'وفي العجلة الندامة' },
      { first: 'من شب على شيء', answer: 'شاب عليه' },
      { first: 'الصديق وقت الضيق', answer: 'الحاجة أم الاختراع' },
      { first: 'أكلت يوم أكل الثور الأبيض', answer: 'من ذاق ظلمة الجهل أدرك أن العلم نور' },
    ],
  },
  opposite: {
    questions: [
      { word: 'كبير', answer: 'صغير' },
      { word: 'طويل', answer: 'قصير' },
      { word: 'سريع', answer: 'بطيء' },
      { word: 'قوي', answer: 'ضعيف' },
      { word: 'غني', answer: 'فقير' },
    ],
  },
  synonyms: {
    questions: [
      { word: 'جميل', options: ['قبيح', 'وسيم', 'طويل'], correct: 'وسيم' },
      { word: 'شجاع', options: ['جبان', 'خائف', 'مقدام'], correct: 'مقدام' },
      { word: 'كريم', options: ['بخيل', 'جواد', 'لئيم'], correct: 'جواد' },
      { word: 'ذكي', options: ['غبي', 'أحمق', 'عبقري'], correct: 'عبقري' },
      { word: 'قوي', options: ['ضعيف', 'متين', 'واهن'], correct: 'متين' },
    ],
  },
  ta: {
    questions: [
      { word: 'مدرسة', answer: '0' },
      { word: 'بيت', answer: '1' },
      { word: 'جامعة', answer: '0' },
      { word: 'كرتون', answer: '1' },
      { word: 'شجرة', answer: '0' },
    ],
  },
  guessyear: {
    questions: [
      { event: 'سقوط جدار برلين', answer: '1989' },
      { event: 'اختراع الهاتف على يد ألكسندر غراهام بيل', answer: '1876' },
      { event: 'هبوط الإنسان على سطح القمر', answer: '1969' },
      { event: 'بداية الحرب العالمية الأولى', answer: '1914' },
      { event: 'تأسيس الأمم المتحدة', answer: '1945' },
    ],
  },
  riddle: {
    questions: [
      { riddle: 'ما الشيء الذي يكسو الناس وهو عارٍ؟', answer: 'الإبرة' },
      { riddle: 'ما الشيء الذي له أسنان ولا يعض؟', answer: 'المشط' },
      { riddle: 'ما الشيء الذي كلما أخذت منه يكبر؟', answer: 'الحفرة' },
      { riddle: 'ما الشيء الذي يكتب ولا يقرأ؟', answer: 'القلم' },
      { riddle: 'ما الشيء الذي تراه في الليل ثلاث مرات وفي النهار مرة؟', answer: 'حرف اللام' },
    ],
  },
  choosepath: {
    questions: [
      { question: 'أنت في غابة مظلمة. أمامك طريقان:', options: ['الطريق الأيسر', 'الطريق الأيمن'], correct: '0' },
    ],
  },
  escape: {
    questions: [
      { question: 'أنت في غرفة مغلقة. اختر الأداة المناسبة:', options: ['مفتاح صدئ', 'مصباح يدوي', 'حبل', 'عصا خشبية'], correct: '0' },
    ],
  },
};

export class AiService {
  private endpoint: string;
  private defaultModel: string;

  constructor(endpoint: string, apiKey: string) {
    this.endpoint = endpoint;
    this.defaultModel = 'gemini3.1pro';
  }

  async generate(request: AiRequest): Promise<AiResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const resp = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-System-Prompt': systemPrompt,
        },
        body: JSON.stringify({
          model: 'gemini3.1pro',
          question: request.prompt,
        }),
      });
      if (!resp.ok) throw new Error(`API returned ${resp.status}`);
      const data = await resp.json();
      if (data.success && data.answer) {
        const parsed = this.parseAiResponse(request.gameType, data.answer);
        if (parsed.success && parsed.question) return parsed;
      }
      throw new Error('API returned unsuccessful response');
    } catch (e) {
      return this.getFallback(request.gameType, request.round);
    }
  }

  private buildSystemPrompt(request: AiRequest): string {
    return `You are an Arabic game content generator for a Telegram bot. Generate creative, unique, and high-quality content for the "${request.gameType}" game. Round ${request.round}. Difficulty: ${request.difficulty}. Respond in JSON format only with relevant fields. No markdown, no extra text. Make content fresh and different each time.`;
  }

  private parseAiResponse(gameType: string, rawAnswer: string): AiResponse {
    try {
      const cleaned = rawAnswer.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        success: true,
        question: parsed.question || parsed.description || parsed.first || parsed.word || parsed.riddle || parsed.event || '',
        options: parsed.options || [],
        correctAnswer: String(parsed.correctAnswer ?? parsed.correct ?? parsed.answer ?? ''),
        storyBranch: parsed.storyBranch || parsed.outcomes || [],
        choices: parsed.choices || parsed.options || [],
        hint: parsed.hint || '',
        explanation: parsed.explanation || '',
        metadata: parsed.metadata || {},
      };
    } catch {
      const lines = rawAnswer.split('\n').filter(l => l.trim());
      return {
        success: true,
        question: lines[0] || rawAnswer,
        options: lines.slice(1, 5),
        correctAnswer: lines[1] || '',
        storyBranch: [],
        choices: [],
        hint: '',
        explanation: '',
        metadata: {},
      };
    }
  }

  private getFallback(gameType: string, round: number): AiResponse {
    const fallback = STATIC_FALLBACKS[gameType];
    if (!fallback || fallback.questions.length === 0) {
      return {
        success: true,
        question: 'سؤال تجريبي',
        options: ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'],
        correctAnswer: 'خيار 1',
        storyBranch: [],
        choices: [],
        hint: '',
        explanation: '',
        metadata: {},
      };
    }
    const idx = round % fallback.questions.length;
    const q = fallback.questions[idx];
    return {
      success: true,
      question: q.question || q.description || q.first || q.word || q.riddle || q.event || '',
      options: q.options || [],
      correctAnswer: String(q.correct ?? q.answer ?? ''),
      storyBranch: q.storyBranch || [],
      choices: q.choices || q.options || [],
      hint: q.hint || '',
      explanation: q.explanation || '',
      metadata: { word: q.word, event: q.event, riddle: q.riddle },
    };
  }
}