const PREFIX = 'rentfind:facility:';
/** 记住租客身份，刷新/重新进入后仍能拉回本人预约。 */
export const profileStore = {
    load() {
        const raw = localStorage.getItem(`${PREFIX}profile`);
        if (raw) {
            try {
                return JSON.parse(raw);
            }
            catch {
                // fall through
            }
        }
        return { name: '', phone: '' };
    },
    save(profile) {
        localStorage.setItem(`${PREFIX}profile`, JSON.stringify(profile));
    },
};
