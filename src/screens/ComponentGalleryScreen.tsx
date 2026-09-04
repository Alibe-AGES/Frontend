import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';

export function ComponentGalleryScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [groupName, setGroupName] = useState('');

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="gap-2">
        <Text className="text-4xl font-black text-ink">Component gallery</Text>
        <Text className="text-inkSoft text-base font-medium">
          A quick visual check for reusable components.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Button</Text>
        <Button title="Primary button" />
        <Button
          title="Secondary button"
          variant="secondary"
        />
        <Button
          title="Disabled button"
          disabled
        />
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">TextInput</Text>
        <TextInput
          label="Nome (alfanumérico)"
          placeholder="Grupo da família"
          type="alphanumeric"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          label="E-mail"
          placeholder="voce@exemplo.com"
          type="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          label="Telefone (numérico)"
          placeholder="11999999999"
          type="numeric"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          label="Descrição (todos os caracteres)"
          placeholder="Fale um pouco sobre o grupo..."
          type="all"
          value={bio}
          onChangeText={setBio}
        />
        <TextInput
          label="Campo desabilitado"
          placeholder="Indisponível"
          value=""
          onChangeText={() => undefined}
          disabled
        />
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">TextInput — com ícone</Text>

        <View className="gap-4 rounded-3xl bg-lime p-5">
          <TextInput
            placeholder="Email"
            type="email"
            value={loginEmail}
            onChangeText={setLoginEmail}
            icon={
              <Ionicons
                name="at"
                size={20}
                color={theme.colors.white}
              />
            }
            iconBackground="coral"
          />
          <TextInput
            placeholder="Senha"
            type="all"
            secureTextEntry
            value={loginPassword}
            onChangeText={setLoginPassword}
            icon={
              <Ionicons
                name="lock-closed"
                size={18}
                color={theme.colors.white}
              />
            }
            iconBackground="coral"
          />
        </View>

        <View className="gap-4 rounded-3xl bg-pink p-5">
          <TextInput
            placeholder="Email"
            type="email"
            value={signUpEmail}
            onChangeText={setSignUpEmail}
            icon={
              <Ionicons
                name="at"
                size={20}
                color={theme.colors.lime}
              />
            }
            iconBackground="ink"
          />
          <TextInput
            placeholder="Senha"
            type="all"
            secureTextEntry
            value={signUpPassword}
            onChangeText={setSignUpPassword}
            icon={
              <Ionicons
                name="lock-closed"
                size={18}
                color={theme.colors.lime}
              />
            }
            iconBackground="ink"
          />
          <TextInput
            placeholder="Confirmar senha"
            type="all"
            secureTextEntry
            value={signUpConfirmPassword}
            onChangeText={setSignUpConfirmPassword}
            icon={
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={theme.colors.lime}
              />
            }
            iconBackground="ink"
          />
        </View>

        <View className="gap-2 rounded-3xl bg-pink p-5">
          <Text className="font-poppins-bold text-base text-ink">Como seus amigos te chamam?</Text>
          <TextInput
            placeholder="Nome de usuário"
            type="alphanumeric"
            value={username}
            onChangeText={setUsername}
            icon={
              <Ionicons
                name="person"
                size={18}
                color={theme.colors.lime}
              />
            }
            iconBackground="ink"
          />
        </View>

        <View className="rounded-3xl bg-lime p-5">
          <TextInput
            placeholder="Nome do grupo"
            type="alphanumeric"
            value={groupName}
            onChangeText={setGroupName}
            icon={
              <Ionicons
                name="pencil"
                size={18}
                color={theme.colors.coral}
              />
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}
