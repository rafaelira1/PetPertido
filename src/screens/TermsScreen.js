import React from 'react';
import { ScrollView, Text } from 'react-native';
import styles from '../postStyles';

const TERMS_VERSION = '1.0';

// Terms of use and privacy policy (RNF07). Opens from Cadastro and from Perfil.
function TermsScreen() {
  return (
    <ScrollView style={styles.container_scroll} contentContainerStyle={styles.content_scroll}>
      <Text style={styles.text_title}>Termos de Uso e Privacidade</Text>

      <Text style={styles.text_label}>1. Aceitação dos Termos</Text>
      <Text style={styles.text_hint}>
        Ao criar uma conta no Pet Perdido, o usuário aceita e concorda com todos os termos e
        condições expostos aqui, vigentes na data.
      </Text>

      <Text style={styles.text_label}>2. Utilização da Aplicação</Text>
      <Text style={styles.text_hint}>
        O Pet Perdido serve para divulgar animais perdidos e encontrados em Fortaleza e aproximar
        quem perdeu de quem encontrou. A aplicação deve ser utilizada de acordo com essa finalidade
        e com a legislação aplicável.
      </Text>

      <Text style={styles.text_label}>3. Responsabilidades do Usuário</Text>
      <Text style={styles.text_hint}>
        O usuário é responsável pelas informações e fotos que publica. Os anúncios devem ser
        verdadeiros. Não informe o endereço exato: use só o bairro e um ponto de referência.
      </Text>

      <Text style={styles.text_label}>4. Dados Coletados</Text>
      <Text style={styles.text_hint}>
        A aplicação guarda o nome, o e-mail e o WhatsApp informados no cadastro, a data do aceite
        destes termos e os anúncios publicados, com foto, bairro e data. Os dados ficam no
        Firebase, serviço do Google.
      </Text>

      <Text style={styles.text_label}>5. Uso dos Dados</Text>
      <Text style={styles.text_hint}>
        O WhatsApp aparece para os usuários logados, no botão de contato dos anúncios. A foto de um
        animal encontrado e a descrição dos anúncios podem ser enviadas à inteligência artificial
        do Google (Gemini), só para descrever o animal e procurar anúncios parecidos. Os dados não
        são vendidos nem usados para publicidade.
      </Text>

      <Text style={styles.text_label}>6. Direitos do Usuário (LGPD)</Text>
      <Text style={styles.text_hint}>
        O usuário pode alterar seus dados, editar ou excluir seus anúncios e excluir a conta a
        qualquer momento, no Perfil. Ao excluir a conta, o perfil e os anúncios são apagados.
      </Text>

      <Text style={styles.text_label}>7. Alterações dos Termos</Text>
      <Text style={styles.text_hint}>
        Estes Termos poderão ser modificados a qualquer momento, em virtude de alterações na
        legislação ou nos serviços da aplicação.
      </Text>

      <Text style={styles.text_hint_center}>Versão dos Termos: {TERMS_VERSION}</Text>
    </ScrollView>
  );
}

export default TermsScreen;
