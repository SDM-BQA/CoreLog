import { useState, useRef } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { UserIcon, AtSignIcon, ImagePlusIcon, XIcon } from "lucide-react";
import { useForm } from "../../../../../@hooks/Form/useForm";
import { validateAvatar, validateUsername } from "../../../../../@validator/auth.validator";


type ProfileSetupValues = {
  username: string;
  avatar: File | null;
};

type Props = {
  onStepComplete: (data: ProfileSetupValues) => void;
  onBack: () => void;
  defaultValues?: Partial<ProfileSetupValues>;
};

const ProfileSetup = ({ onStepComplete, onBack, defaultValues }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useForm<ProfileSetupValues>({
    initialValues: {
      username: defaultValues?.username ?? "",
      avatar: defaultValues?.avatar ?? null,
    },
    validationSchema: {
      username: validateUsername,
      avatar: validateAvatar,
    },
    onSubmit: async (values) => {
      onStepComplete(values);
    },
  });

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFieldValue("avatar", file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    setFieldValue("avatar", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        {/* AVATAR UPLOAD */}
        <div className="flex flex-col gap-2">
          <span className="text-text-secondary text-sm font-medium">
            Profile Picture
            <span className="text-text-secondary/40 font-normal ml-1">
              (optional)
            </span>
          </span>

          {/* Drop zone / Preview */}
          {preview ? (
            /* ── Preview state ── */
            <div className="flex items-center gap-4 p-4 bg-surface rounded-md border border-border">
              <div className="relative w-20 h-20 shrink-0">
                <img
                  src={preview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/40"
                />
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-bg-secondary border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <XIcon size={11} className="text-text-primary" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-text-primary text-sm font-medium truncate max-w-50">
                  {values.avatar?.name}
                </span>
                <span className="text-text-secondary/60 text-xs">
                  {values.avatar
                    ? `${(values.avatar.size / 1024).toFixed(1)} KB`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-accent hover:text-primary transition-colors mt-1 text-left"
                >
                  Change photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center gap-3 px-4 py-8
                bg-surface rounded-md border-2 border-dashed transition-colors cursor-pointer
                ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-secondary hover:bg-accent/5"
                }
              `}
            >
              <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border flex items-center justify-center">
                <ImagePlusIcon size={20} className="text-text-secondary" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-text-primary text-sm font-medium">
                  Drop your photo here
                </span>
                <span className="text-text-secondary/60 text-xs">
                  or{" "}
                  <span className="text-accent hover:text-primary transition-colors">
                    browse files
                  </span>{" "}
                  · JPG, PNG, WEBP · max 5MB
                </span>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {errors.avatar && (
            <span className="text-text-error text-xs">{errors.avatar}</span>
          )}
        </div>

        {/* USERNAME */}
        <label className="flex flex-col gap-2">
          <span className="text-text-secondary text-sm font-medium">
            Username
          </span>
          <div className="flex items-center px-4 py-3 bg-surface rounded-md gap-2 border border-border focus-within:border-border-secondary transition-colors">
            <AtSignIcon size={16} className="text-text-secondary shrink-0" />
            <input
              type="text"
              className="flex-1 outline-none bg-transparent text-sm text-text-primary"
              placeholder="john_doe"
              value={values.username}
              onChange={handleChange("username")}
              disabled={isSubmitting}
              maxLength={20}
            />
            {/* Live char counter */}
            <span
              className={`text-xs tabular-nums shrink-0 transition-colors ${
                values.username.length >= 18
                  ? "text-text-error"
                  : "text-text-secondary/40"
              }`}
            >
              {values.username.length}/20
            </span>
          </div>
          {errors.username ? (
            <span className="text-text-error text-xs">{errors.username}</span>
          ) : (
            <span className="text-text-secondary/50 text-xs">
              This will be your public handle. You can change it later.
            </span>
          )}
        </label>

        {/* USERNAME PREVIEW PILL */}
        {values.username && !errors.username && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-md border border-border w-fit">
            <UserIcon size={13} className="text-text-secondary" />
            <span className="text-text-secondary/60 text-xs">Looks like:</span>
            <span className="text-text-primary text-xs font-medium">
              @{values.username}
            </span>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center justify-center w-full py-3 bg-surface text-text-secondary text-sm font-semibold rounded-md border border-border hover:bg-accent/10 hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex items-center justify-center w-full py-3 bg-primary text-text-primary text-sm font-semibold rounded-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Continue"}
            <FaArrowRightLong
              size={16}
              className="ml-2 group-hover:translate-x-1 transition-all"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileSetup;
