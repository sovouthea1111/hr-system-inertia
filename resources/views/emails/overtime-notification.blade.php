<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overtime Request Notification</title>
</head>
<body class="bg-white text-gray-800 font-sans max-w-xl mx-auto p-6">
    <div class="bg-gray-100 p-6 rounded-lg mb-6 text-center">
        <h1 class="text-2xl font-semibold">New Overtime Request</h1>
    </div>

    <div class="bg-white border border-gray-200 p-6 rounded-lg shadow">
        <p class="mb-4">Dear HR Team,</p>
        
        <p class="mb-4">A new overtime request has been submitted and requires your review.</p>

        <table class="w-full text-left border-t border-gray-200 divide-y divide-gray-100 mb-6">
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Employee Name</th>
                <td class="py-2 px-4">{{ $employee->full_name }}</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Department</th>
                <td class="py-2 px-4">{{ $employee->department }}</td>
            </tr>
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Overtime Date</th>
                <td class="py-2 px-4">{{ \Carbon\Carbon::parse($overtime->overtime_date)->format('d M Y') }}</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Time Period</th>
                <td class="py-2 px-4">{{ $overtime->start_time }} - {{ $overtime->end_time }}</td>
            </tr>
            <tr class="bg-gray-50">
                <th class="py-2 px-4 font-semibold">Hours Worked</th>
                <td class="py-2 px-4">{{ $overtime->hours_worked }} hours</td>
            </tr>
            <tr>
                <th class="py-2 px-4 font-semibold">Overtime Type</th>
                <td class="py-2 px-4">{{ ucfirst($overtime->overtime_type) }}</td>
            </tr>
        </table>

        <div class="mb-6">
            <h3 class="font-semibold mb-2">Reason:</h3>
            <p class="text-gray-700 bg-gray-50 p-3 rounded">{{ $overtime->reason }}</p>
        </div>

        <div class="text-center">
            <p class="text-sm text-gray-600">Please log in to the HR system to review and approve this request.</p>
        </div>
    </div>

    <div class="text-center mt-6 text-sm text-gray-500">
        <p>This is an automated notification from the HR Management System.</p>
    </div>
</body>
</html>