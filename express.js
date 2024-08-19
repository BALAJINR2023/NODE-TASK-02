import express from 'express';
import bodyParser from 'body-parser';
import{rooms,bookings} from './local-variables.js';
const app = express();
const port = 3000;

app.use(bodyParser.json());

// // In-memory storage for rooms and bookings
// let rooms = [];
// let bookings = [];

// Utility function to check if a room is available
const isRoomAvailable = (roomId, startTime, endTime, date) => {
    return !bookings.some(booking => 
        booking.roomId === roomId &&
        booking.date === date &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
    );
};

// Create a new room
app.post('/rooms', (req, res) => {
    const {name, numberOfSeats, amenities, pricePerHour } = req.body;
    if (!name||!numberOfSeats || !amenities || !pricePerHour) {
        return res.status(400).json({ error: 'All fields are required' });
    }else{
    const roomId = rooms.length ? rooms[rooms.length - 1].id + 1 : 1;
    // console.log(roomId);
    const newRoom = { id: roomId, name, numberOfSeats, amenities, pricePerHour };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
    // console.log(rooms);
    }    
});

// Book a room
app.post('/bookings', (req, res) => {
    const { customerName, startTime, endTime, date, roomId } = req.body;

    if (!customerName || !startTime || !endTime || !date || !roomId) {
        return res.status(400).json({ error: 'All fields are required' });
    } const room = rooms.find(r => r.id === Number(roomId)); // if room IDs are numbers
    console.log('Room ID:', roomId);
    console.log('Rooms Array:', rooms);
    console.log('Found Room:', room);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    if (!isRoomAvailable(roomId, startTime, endTime, date)) {
        return res.status(400).json({ error: 'Room is not available at this time' });
    }

    const bookingId = bookings.length ? bookings[bookings.length - 1].id + 1 : 1;
    const newBooking = { id: bookingId, customerName, startTime, endTime, date, roomId };
    bookings.push(newBooking);

    res.status(201).json(newBooking);
});

// List all rooms with booking details
app.get('/rooms', (req, res) => {
    const detailedRooms = rooms.map(room => {
        // const roomBookings = bookings.filter(b => b.roomId === room.id);
        const roomBookings = bookings.filter(b => Number(b.roomId) === Number(room.id));
        //console.log('Bookings Array:', bookings);

        const bookedDates = roomBookings.map(b => ({
            date: b.date,
            bookedStatus: 'Booked',
            customerName: b.customerName,
            startTime: b.startTime,
            endTime: b.endTime
        }));

        return {
            roomId: room.id,
            roomName: room.name,
            numberOfSeats: room.numberOfSeats,
            amenities: room.amenities,
            pricePerHour: room.pricePerHour,
            bookedDates
        };
    });

    res.json(detailedRooms);
});

// List all customers with booking details
app.get('/customers', (req, res) => {
    const customerDetails = bookings.map(booking => ({
        customerName: booking.customerName,
        roomName: rooms.find(r => r.id === Number(booking.roomId)).name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
    }));

    res.json(customerDetails);
});

// List how many times a customer has booked a room
app.get('/booking-history/:customerName', (req, res) => {
    const customerName = req.params.customerName;
    const customerBookings = bookings.filter(b => b.customerName === customerName);

    const detailedBookings = customerBookings.map(b => ({
        customerName: b.customerName,
        roomName: rooms.find(r => r.id === b.roomId).name,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        bookingId: b.id,
        bookingTime: new Date().toISOString(),
        bookingStatus: 'Confirmed'
    }));

    res.json(detailedBookings);
});

app.listen(port, () => {
    console.log( Date().toString(),`Server running at http://localhost:${port}`);
});
