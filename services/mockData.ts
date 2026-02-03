export const OFFICER_PROFILE = {
    name: 'Sri Venkata Rao',
    designation: 'Joint Collector',
    location: 'Guntur',
    avatar: require('../assets/images/profile.png'),
};

export const TASKS = [
    {
        id: '1',
        title: 'Inspect Anganwadi centers',
        location: 'Veldurthi mandal',
        deadline: 'Today, 3 PM',
        status: 'Pending',
        source: 'WhatsApp',
        priority: 'High',
        description: 'Inspect Anganwadi centers in Veldurthi mandal by 3 PM and submit photos before evening.',
    },
    {
        id: '2',
        title: 'Review District Agriculture Plan',
        location: 'Office',
        deadline: 'Tomorrow, 10 AM',
        status: 'Pending',
        source: 'Voice Note',
        priority: 'Medium',
        description: 'Review the draft plan submitted by the agriculture department.',
    },
    {
        id: '3',
        title: 'Approve Water Tank Repairs',
        location: 'Amaravathi',
        deadline: 'Today, 5 PM',
        status: 'Completed',
        source: 'Document',
        priority: 'High',
        description: 'Approve the financial estimates for water tank repairs.',
    },
];

export const MEETINGS = [
    {
        id: '1',
        title: 'Review Meeting with DAOs',
        time: 'Tomorrow, 2:00 PM',
        mode: 'Video Call (Teams)',
        participants: ['All DAOs', 'JC', 'Collector'],
    },
    {
        id: '2',
        title: 'Collector Review',
        time: 'Today, 5:00 PM',
        mode: 'Conference Hall',
        participants: ['Collector', 'JC', 'DRO'],
    },
];

export const DOCUMENTS = [
    {
        id: '1',
        title: 'Water Tank Repairs in Amaravathi',
        type: 'Financial Approval',
        pages: 10,
        summary: 'Request for approval of Rs. 5 Lakhs for urgent repairs. Requires financial clearance.',
        status: 'Action Required',
        date: 'Today',
    },
    {
        id: '2',
        title: 'Q3 Revenue Report',
        type: 'Report',
        pages: 25,
        summary: 'Quarterly revenue report showing 15% increase in collections.',
        status: 'Read',
        date: 'Yesterday',
    },
];

export const APPOINTMENTS = [
    {
        id: '1',
        name: 'Ramesh Kumar',
        type: 'Startup Founder',
        purpose: 'Demo of AI solution for waste management',
        time: 'Requested: Tomorrow 11 AM',
        status: 'Pending',
    },
    {
        id: '2',
        name: 'Sita Devi',
        type: 'Citizen',
        purpose: 'Grievance regarding land mutation',
        time: 'Requested: Today 4 PM',
        status: 'Approved',
    },
];

export const CHATS = [
    {
        id: '1',
        name: 'Chief Secretary',
        avatar: 'https://i.pravatar.cc/150?img=12',
        lastMessage: 'Please send the report by evening.',
        time: '10:30 AM',
        unread: 2,
        isEncrypted: true,
    },
    {
        id: '2',
        name: 'District Collector Guntur',
        avatar: 'https://i.pravatar.cc/150?img=13',
        lastMessage: 'Meeting rescheduled to 4 PM.',
        time: 'Yesterday',
        unread: 0,
        isEncrypted: true,
    },
    {
        id: '3',
        name: 'IT Minister Office',
        avatar: 'https://i.pravatar.cc/150?img=14',
        lastMessage: 'Approved the new proposal.',
        time: 'Yesterday',
        unread: 0,
        isEncrypted: true,
    },
];

export const MESSAGES = [
    {
        id: '1',
        text: 'Good morning, sir. The report is ready.',
        sender: 'me',
        time: '10:00 AM',
    },
    {
        id: '2',
        text: 'Please send the report by evening.',
        sender: 'other',
        time: '10:30 AM',
    },
];
