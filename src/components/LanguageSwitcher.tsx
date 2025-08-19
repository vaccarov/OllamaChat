import { useTranslation } from "react-i18next";
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
        id="languageFlagPicker"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="languageFlagPicker"
        title={t('common.language')}
      >
        <option value="fr">🇫🇷</option>
        <option value="en">🇬🇧</option>
      </select>
  );
};

export default LanguageSwitcher;
