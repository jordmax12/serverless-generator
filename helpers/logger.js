exports.log = (messages, custom = false, show = true) => {
    if (!messages) return;
    const is_messages_array = messages.constructor === Array;
    if (show) {
        console.info(`[${new Date().getTime()}] ${is_messages_array ? messages[0] : messages}`);
        if (is_messages_array) {
            messages.shift();
            for (const message of messages) {
                console.info(`[${new Date().getTime()}] ${message}`);
            }
        }
        return true;
    }
    if (show && custom) {
        console.info(`Logging ${custom} [${new Date().getTime()}] ${message}`);
        return true;
    }
    return false;
};

exports.warn = (messages, custom = false, show = true) => {
    if (!messages) return;
    const is_messages_array = messages.constructor === Array;
    if (show && !custom) {
        // console.warn(`[${new Date().getTime()}] ${message}`);
        console.warn(`[${new Date().getTime()}] ${is_messages_array ? messages[0] : messages}`);
    } else if (show && custom) {
        console.warn(`Logging ${custom} [${new Date().getTime()}] ${is_messages_array ? messages[0] : messages}`);
    }

    if (is_messages_array) {
        messages.shift();
        for (const message of messages) {
            console.warn(`[${new Date().getTime()}] ${message}`);
        }
        return true;
    }
    return false;
};

exports.error = (messages, custom = false, show = true) => {
    if (!messages) return;
    const is_messages_array = messages.constructor === Array;
    if (show && !custom) {
        console.error(`[${new Date().getTime()}] ${is_messages_array ? messages[0] : messages}`);
        return true;
    }
    if (show && custom) {
        console.error(`Logging ${custom} [${new Date().getTime()}] ${message}`);
        return true;
    }

    if (is_messages_array) {
        messages.shift();
        for (const message of messages) {
            console.error(`[${new Date().getTime()}] ${message}`);
        }
        return true;
    }
    return false;
};
