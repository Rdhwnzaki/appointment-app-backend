const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const moment = require('moment-timezone');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/healmity');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    preferred_timezone: { type: DataTypes.STRING, allowNull: false }
});

const Appointment = sequelize.define('Appointment', {
    title: { type: DataTypes.STRING, allowNull: false },
    start: { type: DataTypes.DATE, allowNull: false },
    end: { type: DataTypes.DATE, allowNull: false }
});

const UserAppointment = sequelize.define('UserAppointment', {});

User.hasMany(Appointment, { foreignKey: 'creator_id' });
Appointment.belongsTo(User, { foreignKey: 'creator_id' });
User.belongsToMany(Appointment, { through: UserAppointment });
Appointment.belongsToMany(User, { through: UserAppointment });

sequelize.sync();

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.error('No Authorization header provided');
        return res.status(403).json({ status: 'error', message: 'No token provided', data: null });
    }

    const token = authHeader.split(' ')[1];
    console.log('Received token:', token);

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(401).json({ status: 'error', message: 'Failed to authenticate', data: null });
        }
        req.userId = decoded.id;
        next();
    });
};

app.post('/login', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).json({ status: 'error', message: 'User not found', data: null });

    const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });
    res.json({
        status: 'success',
        message: 'Login successful',
        data: { token }
    });
});

app.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.findAll();

        res.json({
            status: 'success',
            message: 'Users fetched successfully',
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching users',
            data: null
        });
    }
});

app.get('/appointments', authenticate, async (req, res) => {
    const user = await User.findByPk(req.userId, {
        include: { model: Appointment, through: { attributes: [] } }
    });

    const appointments = user.Appointments.map(appointment => {
        return {
            ...appointment.toJSON(),
            start: moment.tz(appointment.start, user.preferred_timezone).format('YYYY-MM-DD HH:mm'),
            end: moment.tz(appointment.end, user.preferred_timezone).format('YYYY-MM-DD HH:mm')
        };
    });

    res.json({
        status: 'success',
        message: 'Appointments fetched successfully',
        data: appointments
    });
});

app.post('/appointments', authenticate, async (req, res) => {
    const { title, start, end, invitedUsers } = req.body;
    const creator = await User.findByPk(req.userId);
    const startTime = moment(start).tz(creator.preferred_timezone);
    const endTime = moment(end).tz(creator.preferred_timezone);

    if (startTime.hour() < 8 || startTime.hour() > 17 || endTime.hour() < 8 || endTime.hour() > 17) {
        return res.status(400).json({ status: 'error', message: 'Appointments must be within working hours (8 AM - 5 PM)', data: null });
    }

    const appointment = await Appointment.create({
        title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        creator_id: req.userId
    });

    for (const userId of invitedUsers) {
        const user = await User.findByPk(userId);
        if (!user) continue;

        const userTimezone = user.preferred_timezone;
        const userStart = startTime.clone().tz(userTimezone).format();
        const userEnd = endTime.clone().tz(userTimezone).format();

        if (moment(userStart).hour() < 8 || moment(userEnd).hour() > 17) {
            return res.status(400).json({
                status: 'error',
                message: `User ${user.username} is outside working hours`,
                data: null
            });
        }

        await appointment.addUser(user);
    }

    res.status(201).json({
        status: 'success',
        message: 'Appointment created successfully',
        data: appointment
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
