// Sample Exam Preparation content: topics, notes, Key Points and practice per course.
import type { Course, QuizQuestion } from "./hendux-data";
import type { TopicSignals } from "./readiness";

export type Topic = {
  id: string;
  title: string;
  weight: number; // how heavily the topic is examined
  seed: TopicSignals;
  notes: { h: string; p: string }[];
  keyPoints: { main: string[]; overlooked: string[] };
  quiz: QuizQuestion[];
};

const SEEDS: TopicSignals[] = [
  { mock: 78, coverage: 90, consistency: 70, quizzes: [{ score: 80, daysAgo: 1 }, { score: 75, daysAgo: 6 }], daysSinceReview: 1 },
  { mock: 40, coverage: 60, consistency: 35, quizzes: [{ score: 50, daysAgo: 2 }, { score: 33, daysAgo: 9 }], daysSinceReview: 2 },
  { mock: 55, coverage: 70, consistency: 50, quizzes: [{ score: 60, daysAgo: 3 }], daysSinceReview: 3 },
  { mock: null, coverage: 30, consistency: null, quizzes: [{ score: 40, daysAgo: 12 }], daysSinceReview: 12 },
  { mock: null, coverage: 20, consistency: null, quizzes: [], daysSinceReview: 30 },
];
const WEIGHTS = [3, 4, 3, 2, 2];

const CSC301: Omit<Topic, "seed" | "weight">[] = [
  {
    id: "process-scheduling",
    title: "Process Scheduling",
    notes: [
      { h: "What the scheduler decides", p: "The short-term scheduler picks which ready process runs next on the CPU. Goals pull against each other: throughput, turnaround time, waiting time, response time and fairness." },
      { h: "Classic algorithms", p: "FCFS is simple but suffers the convoy effect. SJF minimises average waiting time but needs burst estimates. Round Robin uses a time quantum for fairness; priority scheduling risks starvation, fixed by ageing." },
      { h: "Gantt charts", p: "Exam questions usually give arrival and burst times and ask you to draw a Gantt chart, then compute average waiting and turnaround time." },
    ],
    keyPoints: {
      main: ["Turnaround = completion − arrival; waiting = turnaround − burst.", "Round Robin performance depends on the quantum: too large becomes FCFS, too small wastes time on context switches.", "Scheduling links to synchronisation: a process blocked on a lock leaves the ready queue."],
      overlooked: ["Preemptive SJF is called SRTF — examiners use both names.", "Context-switch overhead is often stated in the question; include it."],
    },
    quiz: [
      { q: "Which algorithm gives the minimum average waiting time for a known set of jobs?", options: ["FCFS", "SJF", "Round Robin", "Priority"], answer: 1, explain: "Shortest Job First is provably optimal for average waiting time when burst times are known." },
      { q: "Ageing is used to prevent…", options: ["Deadlock", "Thrashing", "Starvation", "Fragmentation"], answer: 2, explain: "Ageing slowly raises the priority of waiting processes so they eventually run." },
      { q: "Round Robin with a very large quantum behaves like…", options: ["SJF", "FCFS", "Priority", "Multilevel queue"], answer: 1, explain: "If no process uses up its quantum, RR runs jobs in arrival order — FCFS." },
    ],
  },
  {
    id: "virtual-memory",
    title: "Virtual Memory & Paging",
    notes: [
      { h: "Why virtual memory?", p: "Virtual memory lets each process behave as if it owns a large, contiguous address space, while the OS maps only the pages in use to physical frames." },
      { h: "Paging", p: "The logical address space is split into fixed-size pages; physical memory into frames of the same size. A page table maps page numbers to frame numbers. Logical address = (page number, offset)." },
      { h: "Page faults & replacement", p: "When a referenced page is not in memory the MMU raises a page fault. The OS loads it from disk, evicting a victim chosen by FIFO, LRU or Optimal if no frame is free." },
      { h: "Thrashing", p: "If working sets exceed physical memory, the system spends more time paging than executing. Remedies: working-set model, page-fault frequency control, fewer processes." },
    ],
    keyPoints: {
      main: ["Page offset bits = log2(page size).", "LRU and Optimal are stack algorithms — they never show Belady's anomaly.", "Thrashing connects back to scheduling: adding processes can lower CPU utilisation."],
      overlooked: ["Count the initial loads into empty frames as page faults.", "A TLB hit skips the page-table lookup — effective access time questions depend on the hit ratio."],
    },
    quiz: [
      { q: "Which page replacement algorithm suffers from Belady's anomaly?", options: ["LRU", "FIFO", "Optimal", "Clock with reference bit"], answer: 1, explain: "FIFO can produce more page faults when given more frames. Stack algorithms like LRU and Optimal never do." },
      { q: "A system has 4 KB pages. How many bits is the page offset?", options: ["10 bits", "12 bits", "14 bits", "16 bits"], answer: 1, explain: "4 KB = 4096 = 2¹² bytes, so 12 bits address a byte within a page." },
      { q: "Thrashing is best described as…", options: ["A CPU scheduling starvation problem", "Excessive paging that leaves little time for useful work", "A deadlock between two I/O devices", "Fragmentation in contiguous allocation"], answer: 1, explain: "When working sets exceed available frames, the CPU spends most of its time servicing page faults." },
    ],
  },
  {
    id: "deadlocks",
    title: "Deadlocks",
    notes: [
      { h: "Four necessary conditions", p: "Mutual exclusion, hold and wait, no preemption and circular wait must all hold for deadlock. Breaking any one prevents it." },
      { h: "Banker's algorithm", p: "Avoidance: before granting a request, check that the system stays in a safe state — some order exists in which every process can finish." },
      { h: "Detection & recovery", p: "Allow deadlocks, detect cycles in the wait-for graph, then recover by terminating processes or preempting resources." },
    ],
    keyPoints: {
      main: ["Need = Max − Allocation.", "A safe state guarantees no deadlock; an unsafe state does not guarantee one.", "Ordering resources numerically breaks circular wait."],
      overlooked: ["A cycle means deadlock only when every resource has a single instance.", "State the safe sequence explicitly to get full marks."],
    },
    quiz: [
      { q: "Which is NOT a necessary condition for deadlock?", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], answer: 2, explain: "The condition is NO preemption. Allowing preemption breaks deadlock." },
      { q: "In the Banker's algorithm, Need equals…", options: ["Max + Allocation", "Max − Allocation", "Available − Max", "Allocation − Available"], answer: 1, explain: "Need is what a process may still request: its maximum claim minus what it already holds." },
      { q: "An unsafe state…", options: ["Is always deadlocked", "May lead to deadlock", "Can never lead to deadlock", "Means no process can run"], answer: 1, explain: "Unsafe means deadlock is possible, not certain." },
    ],
  },
  {
    id: "synchronisation",
    title: "Process Synchronisation",
    notes: [
      { h: "The critical-section problem", p: "A solution needs mutual exclusion, progress and bounded waiting. Peterson's solution meets all three for two processes." },
      { h: "Semaphores", p: "wait() decrements and may block; signal() increments and may wake a process. Binary semaphores act as mutex locks; counting semaphores manage pools." },
    ],
    keyPoints: {
      main: ["Race conditions happen when outcome depends on execution order.", "Classic problems: producer–consumer, readers–writers, dining philosophers."],
      overlooked: ["Swapping two wait() calls can cause deadlock — a favourite trick question."],
    },
    quiz: [
      { q: "Which property ensures a waiting process eventually enters its critical section?", options: ["Mutual exclusion", "Progress", "Bounded waiting", "Atomicity"], answer: 2, explain: "Bounded waiting limits how many times others can enter before a waiting process gets its turn." },
      { q: "A binary semaphore is commonly used as a…", options: ["Counter", "Mutex lock", "Scheduler", "Page table"], answer: 1, explain: "With values 0 and 1 it gives mutual exclusion, like a lock." },
      { q: "A race condition occurs when…", options: ["Two processes deadlock", "The result depends on the order of execution", "A process starves", "Memory is full"], answer: 1, explain: "Unsynchronised access to shared data makes results order-dependent." },
    ],
  },
  {
    id: "file-systems",
    title: "File Systems",
    notes: [
      { h: "Allocation methods", p: "Contiguous allocation is fast but fragments. Linked allocation avoids fragmentation but has slow random access. Indexed allocation (inodes) balances both." },
      { h: "Directories", p: "Single-level, two-level, tree and acyclic-graph directories trade simplicity for flexibility and sharing." },
    ],
    keyPoints: {
      main: ["Inodes hold metadata and block pointers, not the file name.", "FAT is linked allocation with the links kept in a table."],
      overlooked: ["Compute the maximum file size from direct + indirect pointers carefully — units matter."],
    },
    quiz: [
      { q: "Which allocation method suffers most from external fragmentation?", options: ["Contiguous", "Linked", "Indexed", "FAT"], answer: 0, explain: "Contiguous allocation needs runs of free blocks, leaving gaps over time." },
      { q: "An inode does NOT usually store…", options: ["File size", "Block pointers", "The file name", "Permissions"], answer: 2, explain: "Names live in directory entries that point to inodes." },
      { q: "FAT is a form of…", options: ["Contiguous allocation", "Linked allocation", "Indexed allocation", "Hashed allocation"], answer: 1, explain: "FAT keeps the next-block links in a table instead of inside blocks." },
    ],
  },
];

function genericTopics(course: Course): Omit<Topic, "seed" | "weight">[] {
  const names = [`Foundations of ${course.title}`, "Core concepts & definitions", "Methods and techniques", "Applications & worked problems", "Past-exam favourites"];
  return names.map((title, i) => ({
    id: `topic-${i + 1}`,
    title,
    notes: [
      { h: "Overview", p: `This section of ${course.code} introduces ${title.toLowerCase()} as set out in the departmental course outline.` },
      { h: "What examiners look for", p: "Precise definitions, a clear method and a worked example. Show each step: marks are awarded for method, not just the final answer." },
      { h: "Worked example", p: "Start from the definition, apply it to the given data, then state your conclusion in one sentence that answers the question asked." },
    ],
    keyPoints: {
      main: [`${title} builds on the earlier topics in ${course.code}.`, "Most questions combine this topic with at least one other — revise them together."],
      overlooked: ["Units and assumptions are often worth a mark on their own.", "Re-read the question for words like 'compare', 'derive' and 'explain' — each needs a different answer shape."],
    },
    quiz: [
      { q: `Which approach earns the most marks on a ${course.code} theory question?`, options: ["Final answer only", "Definition, method, worked example", "Long background story", "Diagrams only"], answer: 1, explain: "Marking schemes reward a clear definition, method and example." },
      { q: "What should you check first when reading an exam question?", options: ["How long it is", "The command word (explain, compare, derive)", "The page number", "Who set it"], answer: 1, explain: "The command word tells you the shape of the answer." },
      { q: "Revising topics together helps because…", options: ["Questions often combine topics", "It is faster to read", "Notes are shorter", "It avoids quizzes"], answer: 0, explain: "Exam questions frequently link two or more topics." },
    ],
  }));
}

export function getTopics(course: Course): Topic[] {
  const base = course.id === "csc-301" ? CSC301 : genericTopics(course);
  return base.map((t, i) => ({ ...t, weight: WEIGHTS[i % WEIGHTS.length]!, seed: SEEDS[i % SEEDS.length]! }));
}

export function findTopic(course: Course, topicId: string): Topic | null {
  return getTopics(course).find((t) => t.id === topicId) ?? null;
}
