<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Application Notification</title>
</head>
<body class="bg-white text-gray-800 font-sans max-w-xl mx-auto p-6">
    <div class="bg-gray-100 p-6 rounded-lg mb-6 text-center">
        <h1 class="text-2xl font-semibold">Leave Application Submitted</h1>
    </div>

    <div class="bg-white border border-gray-200 p-6 rounded-lg shadow">
        <p class="mb-4">Dear {{ $employee->name }},</p>
        
        <p class="mb-4">Your leave application has been successfully submitted and is now pending approval.</p>

        <table class="w-full text-left border-t border-gray-200 divide-y divide-gray-100 mb-6">
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Employee Name</th>
                <td class="py-2 px-4">{{ $employee->name }}</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Leave Type</th>
                <td class="py-2 px-4">{{ ucfirst($leave->leave_type) }} Leave</td>
            </tr>
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Start Date</th>
                <td class="py-2 px-4">{{ \Carbon\Carbon::parse($leave->start_date)->format('d M Y') }}</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">End Date</th>
                <td class="py-2 px-4">{{ \Carbon\Carbon::parse($leave->end_date)->format('d M Y') }}</td>
            </tr>
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Total Days</th>
                <td class="py-2 px-4">{{ $leaveDays }} {{ $leaveDays > 1 ? 'days' : 'day' }}</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Reason</th>
                <td class="py-2 px-4">{{ $leave->reason }}</td>
            </tr>
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Status</th>
                <td class="py-2 px-4">
                    <span class="inline-block bg-yellow-400 text-gray-800 text-xs font-bold uppercase px-3 py-1 rounded">
                        {{ $leave->status ?? 'Pending' }}
                    </span>
                </td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Submitted On</th>
                <td class="py-2 px-4">{{ $leave->created_at->format('d M Y, H:i A') }}</td>
            </tr>
        </table>

        <p class="mb-2">You will be notified once your leave application has been reviewed by the management.</p>

        <p class="mb-6">If you have any questions or need to make changes to your application, please contact HR immediately.</p>

        <p>Best regards,<br>
        <span class="font-semibold">HR Department</span></p>
    </div>

    <div class="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        <p>This is an automated email. Please do not reply to this message.</p>
    </div>
</body>
</html>
