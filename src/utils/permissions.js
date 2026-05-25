const { PermissionFlagsBits } = require('discord.js');

/**
 * Kullanıcının yönetici olup olmadığını kontrol eder
 */
function isAdmin(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
}

/**
 * Kullanıcının moderatör olup olmadığını kontrol eder
 */
function isModerator(member) {
    return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
        member.permissions.has(PermissionFlagsBits.Administrator);
}

/**
 * Kullanıcının mesaj yönetimi yapıp yapamayacağını kontrol eder
 */
function canManageMessages(member) {
    return member.permissions.has(PermissionFlagsBits.ManageMessages);
}

/**
 * Hedef kullanıcıya moderasyon işlemi yapılıp yapılamayacağını kontrol eder
 * (Botun rolünden yüksekse işlem yapılamaz)
 */
function canModerate(guild, executor, target) {
    
    if (target.id === guild.ownerId) return false;

    
    if (executor.id !== guild.ownerId) {
        if (target.roles?.highest?.position >= executor.roles?.highest?.position) return false;
    }

    
    const botMember = guild.members.me;
    if (target.roles?.highest?.position >= botMember.roles?.highest?.position) return false;

    return true;
}

module.exports = { isAdmin, isModerator, canManageMessages, canModerate };
