const User = require('../models/User');
const notificationService = require('./notification.service');

const BADGES = {
  FIRST_BACKER: {
    name: 'First Spark',
    description: 'Made your first contribution',
    icon: '✨',
  },
  POWER_BACKER: {
    name: 'Power Backer',
    description: 'Contributed $500+ in total',
    icon: '⚡',
  },
  SERIAL_BACKER: {
    name: 'Serial Supporter',
    description: 'Backed 10+ campaigns',
    icon: '🏆',
  },
  STREAK_7: {
    name: '7-Day Streak',
    description: 'Backed campaigns 7 days in a row',
    icon: '🔥',
  },
  EARLY_BIRD: {
    name: 'Early Bird',
    description: 'Among first 10 backers of a campaign',
    icon: '🐦',
  },
};

exports.onContribution = async (userId, amount, campaign) => {
  const user = await User.findById(userId);
  if (!user) return;

  const newBadges = [];
  const existingBadgeNames = user.badges.map((b) => b.name);

  // XP
  const xpGain = Math.floor(amount * 0.5) + 10;
  await user.addXP(xpGain);

  // First backer badge
  if (user.campaignsBacked === 1 && !existingBadgeNames.includes(BADGES.FIRST_BACKER.name)) {
    newBadges.push(BADGES.FIRST_BACKER);
  }

  // Power backer
  if (user.totalBacked >= 500 && !existingBadgeNames.includes(BADGES.POWER_BACKER.name)) {
    newBadges.push(BADGES.POWER_BACKER);
  }

  // Serial backer
  if (user.campaignsBacked >= 10 && !existingBadgeNames.includes(BADGES.SERIAL_BACKER.name)) {
    newBadges.push(BADGES.SERIAL_BACKER);
  }

  // Early bird (first 10 backers)
  if (campaign.backersCount <= 10 && !existingBadgeNames.includes(BADGES.EARLY_BIRD.name)) {
    newBadges.push(BADGES.EARLY_BIRD);
  }

  // Streak logic
  const now = new Date();
  const lastBacked = user.streaks.lastBackedAt;
  if (lastBacked) {
    const diffDays = Math.floor((now - lastBacked) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streaks.current += 1;
      user.streaks.longest = Math.max(user.streaks.longest, user.streaks.current);
    } else if (diffDays > 1) {
      user.streaks.current = 1;
    }
  } else {
    user.streaks.current = 1;
  }
  user.streaks.lastBackedAt = now;

  if (user.streaks.current >= 7 && !existingBadgeNames.includes(BADGES.STREAK_7.name)) {
    newBadges.push(BADGES.STREAK_7);
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges.map((b) => ({ ...b, awardedAt: new Date() })));
    await user.save({ validateBeforeSave: false });

    for (const badge of newBadges) {
      await notificationService.create({
        recipient: userId,
        type: 'badge_earned',
        title: `${badge.icon} Badge Unlocked: ${badge.name}`,
        message: badge.description,
      });
    }
  } else {
    await user.save({ validateBeforeSave: false });
  }
};
