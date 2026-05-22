import { compactPromptText, getFastModel } from './geminiClient.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_FOCUS_AREAS = ['revision', 'assignments', 'practice'];

const includesAny = (text, words) => words.some((word) => text.includes(word));

const getStudyBlueprint = (topic) => {
  const safeTopic = String(topic || 'study topic').trim();
  const lowerTopic = safeTopic.toLowerCase();

  if (includesAny(lowerTopic, ['programming', 'coding', 'javascript', 'react', 'web', 'python', 'java'])) {
    return {
      actions: [
        `Revise ${safeTopic} concepts and write 5 key notes`,
        `Solve coding problems related to ${safeTopic}`,
        `Build one small feature or mini project in ${safeTopic}`,
        `Debug and refactor previous ${safeTopic} code`
      ],
      resources: ['class notes', 'official docs', 'practice problems', 'GitHub']
    };
  }

  if (includesAny(lowerTopic, ['cyber', 'security', 'network', 'linux', 'hacking'])) {
    return {
      actions: [
        `Revise ${safeTopic} theory with a one-page checklist`,
        `Do a safe hands-on lab for ${safeTopic}`,
        `Document findings, commands, screenshots, and lessons learned`,
        `Practice tool workflow for ${safeTopic}`
      ],
      resources: ['TryHackMe', 'OWASP notes', 'Linux terminal', 'lab writeup']
    };
  }

  if (includesAny(lowerTopic, ['math', 'physics', 'chemistry', 'biology'])) {
    return {
      actions: [
        `Revise formulas and core ideas for ${safeTopic}`,
        `Solve 10 practice questions for ${safeTopic}`,
        `Review mistakes and create a correction sheet`,
        `Attempt one timed mini-test for ${safeTopic}`
      ],
      resources: ['textbook', 'class notes', 'previous questions', 'formula sheet']
    };
  }

  return {
    actions: [
      `Revise key concepts for ${safeTopic}`,
      `Practice questions or exercises for ${safeTopic}`,
      `Make short notes and flashcards for ${safeTopic}`,
      `Review mistakes and plan the next session`
    ],
    resources: ['class notes', 'textbook', 'practice set', 'revision notes']
  };
};

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

const parseTimeToMinutes = (value) => {
  const text = String(value || '').trim().toLowerCase().replace(/\./g, ':').replace(/\s+/g, '');
  const match = text.match(/^(\d{1,2})(?::(\d{1,2}))?(am|pm)?$/);

  if (!match) return null;

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2] || '0', 10);
  const meridiem = match[3];

  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;

  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const parseTimeRange = (timeRange) => {
  const [rawStart, rawEnd] = String(timeRange || '').replace(/[–—]/g, '-').split('-');

  if (!rawStart || !rawEnd) return null;

  const start = parseTimeToMinutes(rawStart);
  const end = parseTimeToMinutes(rawEnd);

  if (start === null || end === null || end <= start) return null;

  return {
    start,
    end,
    duration: end - start,
    label: `${formatMinutes(start)}-${formatMinutes(end)}`
  };
};

const normalizeSchedule = (schedule = []) =>
  schedule
    .map((item, index) => {
      const parsedTime = parseTimeRange(item.time);

      if (!parsedTime) {
        throw new Error(`Invalid time range for ${item.subject || 'class'}: use 09:00-10:00 format`);
      }

      return {
        ...item,
        id: item.id || `${item.day || 'day'}-${index}`,
        day: DAYS.includes(item.day) ? item.day : 'Monday',
        subject: String(item.subject || 'Class').trim(),
        time: parsedTime.label,
        duration: parsedTime.duration,
        startMinutes: parsedTime.start,
        endMinutes: parsedTime.end
      };
    })
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startMinutes - b.startMinutes);

const parseJsonObject = (text) => {
  const withoutFence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || text;
  const jsonMatch = withoutFence.match(/\{[\s\S]*\}/);

  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
};

const StudyPlannerService = {
  async parseTimeTable(timeTableData) {
    try {
      const parsedSchedule = normalizeSchedule(timeTableData.schedule || []);

      return {
        parsedSchedule,
        freeSlotsIdentified: this.identifyFreeSlots(parsedSchedule),
        totalClassHours: this.calculateTotalHours(parsedSchedule)
      };
    } catch (error) {
      console.error('TimeTable Parsing Error:', error);
      throw new Error(error.message || 'Failed to parse timetable');
    }
  },

  identifyFreeSlots(schedule) {
    const normalizedSchedule = normalizeSchedule(schedule);
    const dayStart = 8 * 60;
    const dayEnd = 22 * 60;
    const freeSlots = {};

    DAYS.forEach((day) => {
      const daySchedule = normalizedSchedule.filter((item) => item.day === day);
      const occupied = new Set();

      daySchedule.forEach((item) => {
        for (let minute = item.startMinutes; minute < item.endMinutes; minute += 1) {
          occupied.add(minute);
        }
      });

      const slots = [];
      let slotStart = null;

      for (let minute = dayStart; minute <= dayEnd; minute += 1) {
        if (!occupied.has(minute)) {
          if (slotStart === null) slotStart = minute;
        } else {
          if (slotStart !== null && minute - slotStart >= 45) {
            slots.push(this.createFreeSlot(slotStart, minute));
          }
          slotStart = null;
        }
      }

      if (slotStart !== null && dayEnd - slotStart >= 45) {
        slots.push(this.createFreeSlot(slotStart, dayEnd));
      }

      if (slots.length > 0) {
        freeSlots[day] = slots;
      }
    });

    return freeSlots;
  },

  createFreeSlot(start, end) {
    return {
      start: formatMinutes(start),
      end: formatMinutes(end),
      time: `${formatMinutes(start)}-${formatMinutes(end)}`,
      duration: end - start,
      startMinutes: start,
      endMinutes: end
    };
  },

  calculateTotalHours(schedule) {
    return normalizeSchedule(schedule).reduce((total, item) => total + item.duration, 0) / 60;
  },

  createLocalOptimizedSchedule(parsed, preferences = {}) {
    const focusAreas = Array.isArray(preferences.focusAreas) && preferences.focusAreas.length
      ? preferences.focusAreas
      : DEFAULT_FOCUS_AREAS;
    const subjects = [...new Set(parsed.parsedSchedule.map((item) => item.subject).filter(Boolean))];
    const topics = subjects.length ? subjects : focusAreas;
    let topicIndex = 0;
    let blockIndex = 0;

    const optimizedSchedule = DAYS.map((day) => {
      const hasClass = parsed.parsedSchedule.some((item) => item.day === day);
      const slots = parsed.freeSlotsIdentified[day] || [];
      const schedule = [];

      for (const slot of slots) {
        if (schedule.length >= 2) break;
        if (slot.duration < 45) continue;

        const topic = topics[topicIndex % topics.length];
        const blueprint = getStudyBlueprint(topic);
        const activity = blueprint.actions[blockIndex % blueprint.actions.length];
        const blockLength = Math.min(slot.duration, slot.duration >= 120 ? 90 : 60);
        const start = slot.startMinutes;
        const end = start + blockLength;

        schedule.push({
          time: `${formatMinutes(start)}-${formatMinutes(end)}`,
          activity,
          subject: topic,
          type: blockIndex % 3 === 0 ? 'concept review' : blockIndex % 3 === 1 ? 'practice' : 'project/lab',
          resources: blueprint.resources
        });
        topicIndex += 1;
        blockIndex += 1;
      }

      if (hasClass && schedule.length === 0) {
        const topic = topics[topicIndex % topics.length];
        const blueprint = getStudyBlueprint(topic);
        schedule.push({
          time: '20:00-21:00',
          activity: blueprint.actions[0],
          subject: topic,
          type: 'revision',
          resources: blueprint.resources.slice(0, 2)
        });
        topicIndex += 1;
      }

      return schedule.length ? { day, schedule } : null;
    }).filter(Boolean);

    return {
      optimizedSchedule,
      recommendations: [
        'Use the largest free slot for the hardest or most career-important subject.',
        'Keep blocks to 45-90 minutes and end each block with a visible output: notes, solved problems, code, or lab writeup.',
        'Use the last short block of the day for mistake review and tomorrow planning.'
      ],
      estimatedCompletionTime: '1 week rolling plan',
      peakStudyHours: 'Largest free slots after classes'
    };
  },

  async generateOptimizedSchedule(timeTableData, preferences = {}) {
    const parsed = await this.parseTimeTable(timeTableData);
    const localSchedule = this.createLocalOptimizedSchedule(parsed, preferences);

    try {
      const model = getFastModel({ maxOutputTokens: 900, responseMimeType: 'application/json' });
      const prompt = `You are EduAI, a study coach. Create a compact optimized study schedule.
      
      College schedule:
      ${compactPromptText(JSON.stringify(parsed.parsedSchedule), 3000)}
      
      Free slots:
      ${compactPromptText(JSON.stringify(parsed.freeSlotsIdentified), 3000)}
      
      Quality rules:
      - Be extremely concise. Max 2 study blocks per day.
      - Activities must be specific and include a clear output (notes, code, etc).
      - No filler text.

      Return JSON:
      {
        "optimizedSchedule": [
          {
            "day": "Monday",
            "schedule": [
              {
                "time": "14:00-15:00",
                "activity": "Activity",
                "subject": "Subject",
                "type": "type",
                "resources": ["res1"]
              }
            ]
          }
        ],
        "recommendations": ["tip1"],
        "estimatedCompletionTime": "1 week",
        "peakStudyHours": "evening"
      }`;

      const response = await model.generateContent(prompt);
      const parsedResponse = parseJsonObject(response.response.text());

      if (!parsedResponse?.optimizedSchedule) {
        throw new Error('Invalid AI schedule JSON');
      }

      return parsedResponse;
    } catch (error) {
      console.warn('AI schedule generation fallback:', error.message);
      return localSchedule;
    }
  },

  async suggestStudyResources(subject, studyLevel = 'intermediate') {
    try {
      const model = getFastModel({ maxOutputTokens: 1300, responseMimeType: 'application/json' });

      const prompt = `Suggest the best study resources for "${compactPromptText(subject, 600)}" at ${studyLevel} level.

Return JSON:
{
  "resources": [
    {
      "type": "textbook",
      "title": "Book Title",
      "author": "Author",
      "reason": "Why this resource",
      "link": "URL if available"
    },
    {
      "type": "video course",
      "platform": "YouTube/Udemy/etc",
      "title": "Course Title",
      "duration": "10 hours",
      "reason": "Why this resource"
    },
    {
      "type": "practice",
      "platform": "Website",
      "title": "Practice Platform",
      "reason": "Why this resource"
    }
  ],
  "estimatedTime": "X hours per week",
  "learningPath": ["step1", "step2"]
}

Return ONLY valid JSON.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsedResponse = parseJsonObject(text);

      if (!parsedResponse) throw new Error('Invalid response format');

      return parsedResponse;
    } catch (error) {
      console.error('Resource Suggestion Error:', error);
      return {
        resources: [
          {
            type: 'notes',
            title: `${subject} class notes`,
            author: 'Your course material',
            reason: 'Start with the exact syllabus and examples your teacher expects',
            link: ''
          },
          {
            type: 'practice',
            platform: 'Practice set',
            title: `${subject} weekly practice`,
            reason: 'Practice gives faster improvement than passive reading'
          }
        ],
        estimatedTime: '5-7 hours per week',
        learningPath: ['Revise class notes', 'Solve examples', 'Attempt practice questions', 'Review mistakes'],
        fallback: true
      };
    }
  }
};

export default StudyPlannerService;
