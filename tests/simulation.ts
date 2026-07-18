import { Client } from '@stomp/stompjs';

const BASE_URL = 'http://localhost:8080/api/v1';
const WS_URL = 'ws://localhost:8080/ws/chat';

// Helper to make HTTP POST requests
async function apiPost(path: string, body: any, token?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
    'X-Bypass-Rate-Limit': 'sim-bypass-key',
    'X-Client-Platform': 'mobile'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed with ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

// Helper to make HTTP PUT requests
async function apiPut(path: string, body: any, token: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Bypass-Rate-Limit': 'sim-bypass-key',
      'X-Client-Platform': 'mobile'
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} failed with ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

// Helper to make HTTP GET requests
async function apiGet(path: string, token?: string) {
  const headers: any = {
    'X-Bypass-Rate-Limit': 'sim-bypass-key',
    'X-Client-Platform': 'mobile'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`);
  }
  return res.json();
}

interface SimUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'TUTOR';
  token: string;
  phone: string;
  client?: Client;
  receivedCount: number;
  sentCount: number;
  connected: boolean;
}

// Global stats
const stats = {
  registeredStudents: 0,
  registeredTutors: 0,
  successfulOnboardings: 0,
  wsConnectionsOpened: 0,
  wsConnectionsFailed: 0,
  messagesSent: 0,
  messagesReceived: 0,
  typingEventsSent: 0,
  typingEventsReceived: 0,
  errors: [] as string[],
};

// Delay helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSimulation() {
  console.log('🚀 Starting Concurrency Simulation...\n');

  // Step 1: Fetch subjects to assign during tutor onboarding
  let subjectId: string;
  try {
    console.log('📚 Fetching active subjects...');
    const subjects = await apiGet('/subjects');
    if (!subjects || subjects.length === 0) {
      throw new Error('No active subjects found in the database. Please make sure database is seeded.');
    }
    subjectId = subjects[0].id;
    console.log(`✅ Selected subject: ${subjects[0].name} (ID: ${subjectId})`);
  } catch (err: any) {
    console.error('❌ Failed to fetch subjects:', err.message);
    process.exit(1);
  }

  // Step 2: Register 10 Tutors and 50 Students
  const tutors: SimUser[] = [];
  const students: SimUser[] = [];

  console.log('\n👤 Registering 10 Tutors and 50 Students concurrently...');

  // 2.1 Register Tutors
  const tutorRegPromises = Array.from({ length: 10 }).map(async (_, idx) => {
    const num = idx + 1;
    const email = `sim_tutor_${num}@ogret.io`;
    const phone = `5553000000`.slice(0, -num.toString().length) + num;
    const fullName = `Simulated Tutor ${num}`;
    try {
      // Try to register new user. If conflict, we'll try to log in (to make script re-runnable)
      let auth;
      try {
        auth = await apiPost('/auth/register', {
          email,
          phone,
          password: 'password123',
          fullName,
          role: 'TUTOR',
        });
      } catch (err: any) {
        // Try login
        try {
          auth = await apiPost('/auth/login', {
            email,
            password: 'password123',
          });
        } catch (loginErr: any) {
          console.error(`Tutor Reg/Login failed for ${email}: ${err.message} | Login error: ${loginErr.message}`);
          throw loginErr;
        }
      }
      tutors.push({
        id: auth.user.id,
        email,
        fullName,
        role: 'TUTOR',
        token: auth.accessToken,
        phone,
        receivedCount: 0,
        sentCount: 0,
        connected: false,
      });
      stats.registeredTutors++;
    } catch (err: any) {
      stats.errors.push(`Tutor registration failed (${email}): ${err.message}`);
    }
  });

  // 2.2 Register Students
  const studentRegPromises = Array.from({ length: 50 }).map(async (_, idx) => {
    const num = idx + 1;
    const email = `sim_student_${num}@ogret.io`;
    const phone = `5554000000`.slice(0, -num.toString().length) + num;
    const fullName = `Simulated Student ${num}`;
    try {
      let auth;
      try {
        auth = await apiPost('/auth/register', {
          email,
          phone,
          password: 'password123',
          fullName,
          role: 'STUDENT',
        });
      } catch (err: any) {
        try {
          auth = await apiPost('/auth/login', {
            email,
            password: 'password123',
          });
        } catch (loginErr: any) {
          console.error(`Student Reg/Login failed for ${email}: ${err.message} | Login error: ${loginErr.message}`);
          throw loginErr;
        }
      }
      students.push({
        id: auth.user.id,
        email,
        fullName,
        role: 'STUDENT',
        token: auth.accessToken,
        phone,
        receivedCount: 0,
        sentCount: 0,
        connected: false,
      });
      stats.registeredStudents++;
    } catch (err: any) {
      stats.errors.push(`Student registration failed (${email}): ${err.message}`);
    }
  });

  await Promise.all([...tutorRegPromises, ...studentRegPromises]);
  console.log(`✅ Registration complete. Registered ${tutors.length} tutors and ${students.length} students.`);

  // Step 3: Complete Profile Onboarding for Tutors and Students
  console.log('\n📝 Completing onboarding and profile details...');
  const onboardingPromises = [
    ...tutors.map(async (tutor, idx) => {
      try {
        const longDescription = 'Bu ders kapsamında, öğrencimizin ihtiyaçlarına ve seviyesine özel olarak hazırladığımız çalışma planı üzerinden ilerleyeceğiz. Konuların mantığını kavramaya yönelik, ezberden uzak ve bol pratik içeren bir anlatım tarzı benimsiyorum. Her ders sonunda verdiğimiz ödevler ve yaptığımız geri bildirimler sayesinde gelişimi adım adım takip ediyoruz. Amacımız sadece sınav başarısı değil, aynı zamanda konuya olan ilgisini ve özgüvenini artırmaktır.';
        const longAbout = 'Uzun yıllardır özel ders sektöründe yer alan, alanında uzman ve deneyimli bir öğretmenim. Boğaziçi Üniversitesi mezuniyetimin ardından, yüzlerce öğrenciyle LGS, YKS ve okul derslerine takviye çalışmalar yürüttüm. Her öğrencinin öğrenme hızının ve tarzının farklı olduğuna inanıyorum. Sabırlı, güler yüzlü ve motive edici yaklaşımımla, öğrencilerin zorlandığı konuları en temelden alarak seviyelerini yukarı taşıyorum.';

        // Update user profile details
        await apiPut('/users/me', {
          fullName: tutor.fullName,
          bio: longAbout,
          education: 'Istanbul Technical University',
          experienceYears: 6 + idx,
          hourlyRate: 350 + idx * 25,
          phone: tutor.phone,
        }, tutor.token);

        // Update subjects
        await apiPut('/tutors/me/subjects', [subjectId], tutor.token);

        // Update availability
        await apiPut('/tutors/me/availability', [
          { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
        ], tutor.token);

        // Create tutor listing
        try {
          await apiPost('/tutors/me/listings', {
            subjectId,
            title: `Professional tutoring by ${tutor.fullName}`,
            lessonDescription: longDescription,
            aboutTutor: longAbout,
            hourlyRate: 350 + idx * 25,
            allowsTutorHome: true,
            allowsStudentHome: true,
            allowsOnline: true,
            maxTravelDistanceKm: 15,
            languages: ['Türkçe'],
            experienceYears: 6 + idx,
          }, tutor.token);
        } catch (err: any) {
          if (err.message.includes('409')) {
            // Already created in a previous run, safe to ignore
          } else {
            throw err;
          }
        }

        stats.successfulOnboardings++;
      } catch (err: any) {
        console.error(`Tutor onboarding failed for ${tutor.email}:`, err.message);
        stats.errors.push(`Tutor onboarding failed (${tutor.email}): ${err.message}`);
      }
    }),
    ...students.map(async (student, idx) => {
      try {
        // Complete basic student profile
        await apiPut('/users/me', {
          fullName: student.fullName,
          phone: student.phone,
        }, student.token);
        stats.successfulOnboardings++;
      } catch (err: any) {
        console.error(`Student profile update failed for ${student.email}:`, err.message);
        stats.errors.push(`Student profile update failed (${student.email}): ${err.message}`);
      }
    }),
  ];

  await Promise.all(onboardingPromises);
  console.log(`✅ Onboarding complete. Completed ${stats.successfulOnboardings}/${tutors.length + students.length} profile flows.`);

  // Step 4: Establish Concurrent WebSocket Connections
  console.log('\n🔌 Establishing 60 concurrent WebSocket connections over STOMP...');
  const allUsers = [...tutors, ...students];
  const connectionPromises = allUsers.map((user, idx) => {
    return new Promise<void>(async (resolve) => {
      await sleep(idx * 50);
      const client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
        reconnectDelay: 0,
        debug: () => {},
        onConnect: () => {
          user.connected = true;
          stats.wsConnectionsOpened++;

          // Subscribe to messages
          client.subscribe('/user/queue/messages', (msg) => {
            user.receivedCount++;
            stats.messagesReceived++;
            try {
              const body = JSON.parse(msg.body);
              handleIncomingMessage(user, body);
            } catch { /* ignore */ }
          });

          // Subscribe to typing indicators
          client.subscribe('/user/queue/typing', () => {
            stats.typingEventsReceived++;
          });

          resolve();
        },
        onStompError: (frame) => {
          stats.wsConnectionsFailed++;
          stats.errors.push(`STOMP error for ${user.email}: ${frame.headers['message']}`);
          resolve();
        },
        onWebSocketError: (evt) => {
          stats.wsConnectionsFailed++;
          stats.errors.push(`WebSocket error for ${user.email}`);
          resolve();
        },
        onWebSocketClose: () => {
          user.connected = false;
          stats.wsConnectionsFailed++;
          stats.errors.push(`WebSocket closed for ${user.email}`);
          resolve();
        },
      });

      user.client = client;
      client.activate();
    });
  });

  // Wait for all connections to establish (or fail)
  await Promise.all(connectionPromises);
  console.log(`✅ WebSocket connection phase complete: ${stats.wsConnectionsOpened} connected, ${stats.wsConnectionsFailed} failed.`);

  if (stats.wsConnectionsOpened === 0) {
    console.error('❌ No active connections established. Exiting.');
    if (stats.errors.length > 0) {
      console.error('\n⚠️ Encountered errors:');
      stats.errors.forEach((err) => console.error(`  - ${err}`));
    }
    process.exit(1);
  }

  // Map tutor ID to user object for easy lookup
  const tutorMap = new Map<string, SimUser>(tutors.map((t) => [t.id, t]));
  const studentMap = new Map<string, SimUser>(students.map((s) => [s.id, s]));

  // Handle incoming message responses
  function handleIncomingMessage(receiver: SimUser, message: any) {
    const senderId = message.senderId;
    const content = message.content;

    // A tutor receives a message from a student
    if (receiver.role === 'TUTOR') {
      const studentUser = studentMap.get(senderId);
      if (!studentUser) return;

      // Handle sequence
      if (content.includes('ders almak istiyorum')) {
        // Tutor replies after a small delay
        setTimeout(() => {
          sendWsTyping(receiver, studentUser.id);
          setTimeout(() => {
            sendWsMessage(receiver, studentUser.id, `Merhaba ${studentUser.fullName}, tabii ki yardımcı olabilirim. Ne zaman müsaitsiniz?`);
          }, 400);
        }, 300);
      } else if (content.includes('uygun mudur')) {
        // Tutor replies confirming lesson
        setTimeout(() => {
          sendWsTyping(receiver, studentUser.id);
          setTimeout(() => {
            sendWsMessage(receiver, studentUser.id, 'Evet, bu saat uygundur. Sistem üzerinden rezervasyon talebi açabilirsiniz.');
          }, 400);
        }, 300);
      }
    }
    // A student receives a reply from a tutor
    else if (receiver.role === 'STUDENT') {
      const tutorUser = tutorMap.get(senderId);
      if (!tutorUser) return;

      if (content.includes('Ne zaman müsaitsiniz')) {
        // Student proposes slot
        setTimeout(() => {
          sendWsTyping(receiver, tutorUser.id);
          setTimeout(() => {
            sendWsMessage(receiver, tutorUser.id, 'Salı günü saat 14:00 sizin için uygun mudur?');
          }, 400);
        }, 300);
      }
    }
  }

  function sendWsMessage(sender: SimUser, receiverId: string, content: string) {
    if (!sender.client?.connected) return;
    sender.client.publish({
      destination: `/app/chat.send/${receiverId}`,
      body: JSON.stringify({ content }),
    });
    sender.sentCount++;
    stats.messagesSent++;
  }

  function sendWsTyping(sender: SimUser, receiverId: string) {
    if (!sender.client?.connected) return;
    sender.client.publish({
      destination: `/app/chat.typing/${receiverId}`,
      body: JSON.stringify({}),
    });
    stats.typingEventsSent++;
  }

  // Step 5: Start chat simulation
  console.log('\n💬 Simulating message exchanges concurrently (each student contacts 1 random tutor)...');

  // We pair each student with a random tutor
  const chatStartPromises = students.map(async (student) => {
    // Pick random tutor
    const randomTutor = tutors[Math.floor(Math.random() * tutors.length)];
    if (!randomTutor || !student.client?.connected) return;

    // Wait a staggered start to avoid hitting rate limits instantly
    await sleep(Math.random() * 5000);

    // Start flow: send typing, then message
    sendWsTyping(student, randomTutor.id);
    await sleep(300);
    sendWsMessage(student, randomTutor.id, `Merhaba hocam, ders almak istiyorum. (${student.fullName})`);
  });

  await Promise.all(chatStartPromises);

  // Let the simulation run and exchange messages for 10 seconds
  console.log('⏳ Running message simulation loop for 10 seconds...');
  await sleep(10000);

  // Step 6: Shut down and cleanup
  console.log('\n🔌 Closing WebSocket connections...');
  allUsers.forEach((user) => {
    if (user.client?.connected) {
      user.client.deactivate();
    }
  });

  console.log('✅ Simulation completed.\n');

  // Print Summary Report
  console.log('=====================================================');
  console.log('                SIMULATION REPORT                     ');
  console.log('=====================================================');
  console.log(`Registered Tutors:              ${stats.registeredTutors}`);
  console.log(`Registered Students:            ${stats.registeredStudents}`);
  console.log(`Completed Onboardings:          ${stats.successfulOnboardings}`);
  console.log(`Active WebSocket Connections:   ${stats.wsConnectionsOpened}`);
  console.log(`Failed WebSocket Connections:   ${stats.wsConnectionsFailed}`);
  console.log(`Total Messages Sent:            ${stats.messagesSent}`);
  console.log(`Total Messages Received:        ${stats.messagesReceived}`);
  console.log(`Total Typing Events Sent:       ${stats.typingEventsSent}`);
  console.log(`Total Typing Events Received:   ${stats.typingEventsReceived}`);
  console.log('-----------------------------------------------------');
  if (stats.errors.length > 0) {
    console.log(`⚠️ Errors Encountered (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach((err) => console.log(`  - ${err}`));
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  } else {
    console.log('✅ No errors encountered during simulation!');
  }
  console.log('=====================================================');
}

runSimulation();
