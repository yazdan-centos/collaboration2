import React, {useState} from 'react';
import SmartForm from './SmartForm';

export default function SmartFormExample() {
    const [submittedValues, setSubmittedValues] = useState(null);

    return (
        <section style={{maxWidth: 520, margin: '32px auto', padding: 24, background: '#fff'}}>
            <h2>SmartForm example</h2>
            <SmartForm
                defaultValues={{fullName: '', email: '', role: '', description: ''}}
                onSubmit={setSubmittedValues}
            >
                <input
                    name="fullName"
                    label="Full name"
                    placeholder="Jane Doe"
                    rules={{required: 'Full name is required.'}}
                />
                <input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="jane@example.com"
                    rules={{
                        required: 'Email is required.',
                        pattern: {value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.'},
                    }}
                />
                <select name="role" label="Role" rules={{required: 'Select a role.'}}>
                    <option value="">Choose a role</option>
                    <option value="manager">Manager</option>
                    <option value="member">Team member</option>
                </select>
                <textarea name="description" label="Description" rows={4}/>
                <button type="submit">Submit</button>
            </SmartForm>

            {submittedValues && (
                <pre aria-live="polite">{JSON.stringify(submittedValues, null, 2)}</pre>
            )}
        </section>
    );
}
